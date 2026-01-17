require('dotenv').config();
const db = require('./src/config/database');

async function createNotificationsTable() {
  try {
    console.log('알림 테이블 생성 중...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('승차', '하차', '운행시작', '운행종료', '비상') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        child_id INT NULL,
        bus_id INT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES shuttle_users(id) ON DELETE CASCADE,
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
        FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, is_read, created_at DESC)
      )
    `);
    
    console.log('✅ 알림 테이블 생성 완료!');
    process.exit(0);
  } catch (err) {
    console.error('❌ 테이블 생성 실패:', err);
    process.exit(1);
  }
}

createNotificationsTable();
