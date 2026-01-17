const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shuttle_bus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 연결 유지 및 재연결 설정
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // 타임아웃 설정
  connectTimeout: 60000, // 60초
  acquireTimeout: 60000,
  timeout: 60000
};

// SSL 설정이 필요한 경우 (Aiven 등)
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED') {
  dbConfig.ssl = {
    rejectUnauthorized: false // Aiven 자체 서명 인증서 허용
  };
}

const pool = mysql.createPool(dbConfig);

// 연결 테스트 및 에러 핸들링
pool.on('connection', (connection) => {
  console.log('새 DB 연결 생성됨');
});

pool.on('acquire', (connection) => {
  console.log('DB 연결 획득: ID %d', connection.threadId);
});

pool.on('release', (connection) => {
  console.log('DB 연결 반환: ID %d', connection.threadId);
});

// 주기적으로 연결 상태 확인 (5분마다)
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('DB 연결 상태 확인 완료');
  } catch (err) {
    console.error('DB 연결 상태 확인 실패:', err.message);
  }
}, 5 * 60 * 1000);

module.exports = pool;
