const { socketAuthMiddleware } = require('./middleware/socketAuth');
const NotificationService = require('./services/notificationService');
const locationService = require('./services/locationService');
const DriverHandler = require('./handlers/driverHandler');
const ParentHandler = require('./handlers/parentHandler');
const EmergencyHandler = require('./handlers/emergencyHandler');

/**
 * Socket.IO 초기화
 */
function initSocket(io) {
  // 인증 미들웨어 적용
  io.use(socketAuthMiddleware);

  // 서비스 초기화
  const notificationService = new NotificationService(io);
  
  // 핸들러 초기화
  const driverHandler = new DriverHandler(io, notificationService);
  const parentHandler = new ParentHandler(io, notificationService);
  const emergencyHandler = new EmergencyHandler(io, notificationService);

  io.on('connection', (socket) => {
    console.log(`사용자 연결: ${socket.user.id} (${socket.user.role})`);
    
    // 사용자별 룸에 자동 참여 (개인 알림용)
    socket.join(`user:${socket.user.id}`);

    // 역할별 핸들러 등록
    driverHandler.register(socket);
    parentHandler.register(socket);
    emergencyHandler.register(socket);

    socket.on('disconnect', () => {
      console.log(`사용자 연결 해제: ${socket.user.id}`);
    });
  });
}

// 하위 호환성을 위해 busLocations export
module.exports = { 
  initSocket, 
  busLocations: locationService.getAllLocations() 
};
