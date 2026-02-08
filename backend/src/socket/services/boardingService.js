const db = require('../../config/database');

class BoardingService {
  /**
   * 승차 처리
   */
  async processBoarding(childId, busId) {
    console.log(`\n=== 승차 처리 시작 ===`);
    console.log(`아이 ID: ${childId}, 버스 ID: ${busId}`);
    
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 승차 로그 저장
      await connection.execute(
        'INSERT INTO boarding_log (child_id, bus_id, type) VALUES (?, ?, ?)',
        [childId, busId, '승차']
      );
      console.log('✅ boarding_log 저장 완료');
      
      // 해당 아이의 부모 ID 조회
      const [children] = await connection.execute(
        'SELECT parent_id, name FROM children WHERE id = ?',
        [childId]
      );
      
      if (children.length === 0) {
        console.error('❌ 아이 정보를 찾을 수 없음');
        await connection.rollback();
        connection.release();
        return null;
      }
      
      const parentId = children[0]?.parent_id;
      const childName = children[0]?.name;
      
      console.log(`부모 ID: ${parentId}, 아이 이름: ${childName}`);
      
      // 알림 DB에 저장
      await connection.execute(
        'INSERT INTO notifications (user_id, type, title, message, child_id, bus_id) VALUES (?, ?, ?, ?, ?, ?)',
        [parentId, '승차', '승차 알림', `${childName}이(가) 버스에 탑승했습니다.`, childId, busId]
      );
      console.log('✅ 알림 DB 저장 완료');
      
      await connection.commit();
      connection.release();
      
      console.log('✅ 승차 처리 완료\n');
      
      return {
        childId,
        busId,
        parentId,
        childName,
        time: new Date()
      };
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error('❌ 승차 처리 오류:', err);
      throw err;
    }
  }

  /**
   * 하차 처리
   */
  async processAlighting(childId, busId) {
    console.log(`\n=== 하차 처리 시작 ===`);
    console.log(`아이 ID: ${childId}, 버스 ID: ${busId}`);
    
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.execute(
        'INSERT INTO boarding_log (child_id, bus_id, type) VALUES (?, ?, ?)',
        [childId, busId, '하차']
      );
      
      // 해당 아이의 부모 ID 조회
      const [children] = await connection.execute(
        'SELECT parent_id, name FROM children WHERE id = ?',
        [childId]
      );
      
      if (children.length === 0) {
        console.error('❌ 아이 정보를 찾을 수 없음');
        await connection.rollback();
        connection.release();
        return null;
      }
      
      const parentId = children[0]?.parent_id;
      const childName = children[0]?.name;
      
      console.log(`부모 ID: ${parentId}, 아이 이름: ${childName}`);
      
      // 알림 DB에 저장
      await connection.execute(
        'INSERT INTO notifications (user_id, type, title, message, child_id, bus_id) VALUES (?, ?, ?, ?, ?, ?)',
        [parentId, '하차', '하차 알림', `${childName}이(가) 버스에서 하차했습니다.`, childId, busId]
      );
      
      await connection.commit();
      connection.release();
      
      console.log('✅ 하차 처리 완료\n');
      
      return {
        childId,
        busId,
        parentId,
        childName,
        time: new Date()
      };
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error('❌ 하차 처리 오류:', err);
      throw err;
    }
  }
}

module.exports = new BoardingService();
