const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shuttle_bus',
  waitForConnections: true,
  connectionLimit: 10
};

// SSL 설정이 필요한 경우 (Aiven 등)
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED') {
  dbConfig.ssl = {
    rejectUnauthorized: false // Aiven 자체 서명 인증서 허용
  };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;
