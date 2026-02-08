require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shuttle_bus',
};

if (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED') {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

async function clearNotifications() {
  let connection;
  try {
    console.log('🗑️  알림 데이터 삭제 시작...');
    
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.query('DELETE FROM notifications');
    
    console.log(`✅ ${result.affectedRows}개의 알림이 삭제되었습니다.`);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ 알림 삭제 실패:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

clearNotifications();
