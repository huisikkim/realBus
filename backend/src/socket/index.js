const jwt = require('jsonwebtoken');
const db = require('../config/database');

// 버스별 실시간 위치 저장 (메모리)
const busLocations = new Map();

function initSocket(io) {
  // 인증 미들웨어
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('인증이 필요합니다'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('유효하지 않은 토큰입니다'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`사용자 연결: ${socket.user.id} (${socket.user.role})`);
    
    // 사용자별 룸에 자동 참여 (개인 알림용)
    socket.join(`user:${socket.user.id}`);

    // 기사: 위치 업데이트
    socket.on('driver:updateLocation', async (data) => {
      if (socket.user.role !== 'driver') return;

      const { busId, latitude, longitude, speed } = data;
      const locationData = {
        busId,
        latitude,
        longitude,
        speed,
        timestamp: new Date()
      };

      // 메모리에 저장
      busLocations.set(busId, locationData);

      // DB에 기록 (히스토리)
      try {
        await db.execute(
          'INSERT INTO location_history (bus_id, latitude, longitude, speed) VALUES (?, ?, ?, ?)',
          [busId, latitude, longitude, speed || 0]
        );
      } catch (err) {
        console.error('위치 저장 오류:', err);
      }

      // 해당 버스를 구독 중인 부모들에게 브로드캐스트
      io.to(`bus:${busId}`).emit('bus:locationUpdate', locationData);
    });

    // 기사: 운행 시작
    socket.on('driver:startTrip', async (data) => {
      if (socket.user.role !== 'driver') return;

      const { busId } = data;
      try {
        await db.execute(
          'UPDATE buses SET status = ?, current_trip_start = NOW() WHERE id = ?',
          ['운행중', busId]
        );
        io.to(`bus:${busId}`).emit('bus:tripStarted', { busId, startTime: new Date() });
      } catch (err) {
        console.error('운행 시작 오류:', err);
      }
    });

    // 기사: 운행 종료
    socket.on('driver:endTrip', async (data) => {
      if (socket.user.role !== 'driver') return;

      const { busId } = data;
      try {
        await db.execute(
          'UPDATE buses SET status = ?, current_trip_start = NULL WHERE id = ?',
          ['대기', busId]
        );
        busLocations.delete(busId);
        io.to(`bus:${busId}`).emit('bus:tripEnded', { busId, endTime: new Date() });
      } catch (err) {
        console.error('운행 종료 오류:', err);
      }
    });

    // 기사: 승차 처리
    socket.on('driver:childBoarded', async (data) => {
      if (socket.user.role !== 'driver') return;

      const { childId, busId } = data;
      try {
        await db.execute(
          'INSERT INTO boarding_log (child_id, bus_id, type) VALUES (?, ?, ?)',
          [childId, busId, '승차']
        );
        
        // 해당 아이의 부모 ID 조회
        const [children] = await db.execute(
          'SELECT parent_id, name FROM children WHERE id = ?',
          [childId]
        );
        
        const parentId = children[0]?.parent_id;
        const childName = children[0]?.name;
        
        console.log(`승차 처리: 아이 ID ${childId}, 부모 ID ${parentId}, 버스 ID ${busId}`);
        
        // 버스 룸에 브로드캐스트 (모든 구독자에게)
        io.to(`bus:${busId}`).emit('child:boarded', { 
          childId, 
          busId, 
          parentId,
          childName,
          time: new Date() 
        });
        
        // 부모에게 직접 전송 (연결되어 있다면)
        const parentSockets = await io.in(`user:${parentId}`).fetchSockets();
        if (parentSockets.length > 0) {
          console.log(`부모 ${parentId}에게 직접 승차 알림 전송`);
          io.to(`user:${parentId}`).emit('child:boarded', { 
            childId, 
            busId, 
            parentId,
            childName,
            time: new Date() 
          });
        }
      } catch (err) {
        console.error('승차 처리 오류:', err);
      }
    });

    // 기사: 하차 처리
    socket.on('driver:childAlighted', async (data) => {
      if (socket.user.role !== 'driver') return;

      const { childId, busId } = data;
      try {
        await db.execute(
          'INSERT INTO boarding_log (child_id, bus_id, type) VALUES (?, ?, ?)',
          [childId, busId, '하차']
        );
        
        // 해당 아이의 부모 ID 조회
        const [children] = await db.execute(
          'SELECT parent_id, name FROM children WHERE id = ?',
          [childId]
        );
        
        const parentId = children[0]?.parent_id;
        const childName = children[0]?.name;
        
        console.log(`하차 처리: 아이 ID ${childId}, 부모 ID ${parentId}, 버스 ID ${busId}`);
        
        // 버스 룸에 브로드캐스트
        io.to(`bus:${busId}`).emit('child:alighted', { 
          childId, 
          busId, 
          parentId,
          childName,
          time: new Date() 
        });
        
        // 부모에게 직접 전송
        const parentSockets = await io.in(`user:${parentId}`).fetchSockets();
        if (parentSockets.length > 0) {
          console.log(`부모 ${parentId}에게 직접 하차 알림 전송`);
          io.to(`user:${parentId}`).emit('child:alighted', { 
            childId, 
            busId, 
            parentId,
            childName,
            time: new Date() 
          });
        }
      } catch (err) {
        console.error('하차 처리 오류:', err);
      }
    });

    // 부모: 버스 구독
    socket.on('parent:subscribeBus', (data) => {
      if (socket.user.role !== 'parent') return;

      const { busId } = data;
      socket.join(`bus:${busId}`);

      // 현재 위치 즉시 전송
      const currentLocation = busLocations.get(busId);
      if (currentLocation) {
        socket.emit('bus:locationUpdate', currentLocation);
      }
    });

    // 부모: 버스 구독 해제
    socket.on('parent:unsubscribeBus', (data) => {
      const { busId } = data;
      socket.leave(`bus:${busId}`);
    });

    // 비상 알림
    socket.on('emergency', async (data) => {
      const { busId, message } = data;
      try {
        await db.execute(
          'INSERT INTO emergency_log (bus_id, user_id, message) VALUES (?, ?, ?)',
          [busId, socket.user.id, message]
        );
        io.to(`bus:${busId}`).emit('emergency:alert', {
          busId,
          message,
          time: new Date(),
          location: busLocations.get(busId)
        });
      } catch (err) {
        console.error('비상 알림 오류:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`사용자 연결 해제: ${socket.user.id}`);
    });
  });
}

module.exports = { initSocket, busLocations };
