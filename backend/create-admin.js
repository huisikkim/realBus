require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const connectionConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  // SSL 설정 추가
  if (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED') {
    connectionConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  console.log('관리자 계정 생성 중...\n');

  try {
    const connection = await mysql.createConnection(connectionConfig);

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 기존 admin@admin.com 계정 확인
    const [existing] = await connection.execute(
      'SELECT * FROM shuttle_users WHERE email = ?',
      ['admin@admin.com']
    );

    if (existing.length > 0) {
      console.log('⚠️  admin@admin.com 계정이 이미 존재합니다.');
      console.log('비밀번호를 업데이트할까요? (기존 계정 삭제 후 재생성)\n');
      
      // 기존 계정 삭제 후 재생성
      await connection.execute('DELETE FROM shuttle_users WHERE email = ?', ['admin@admin.com']);
      console.log('기존 계정 삭제 완료');
    }

    // 관리자 계정 생성
    await connection.execute(
      'INSERT INTO shuttle_users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@admin.com', hashedPassword, '관리자', 'admin']
    );

    console.log('✅ 관리자 계정 생성 완료!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 이메일: admin@admin.com');
    console.log('🔑 비밀번호: 123456');
    console.log('👤 역할: 관리자 (admin)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await connection.end();

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  }
}

createAdmin();
