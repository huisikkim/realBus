const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔄 데이터베이스 연결 중...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: true
      } : undefined
    });

    console.log('✅ 데이터베이스 연결 성공');
    console.log('⚠️  모든 테이블 데이터를 삭제합니다...\n');

    // 외래 키 체크 비활성화
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 모든 테이블 데이터 삭제 (순서 중요)
    const tables = [
      'notifications',
      'emergency_log',
      'boarding_log',
      'location_history',
      'stops',
      'children',
      'buses',
      'shuttle_users'
    ];

    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`✅ ${table} 테이블 초기화 완료`);
      } catch (err) {
        console.log(`⚠️  ${table} 테이블 초기화 실패 (테이블이 없을 수 있음):`, err.message);
      }
    }

    // 외래 키 체크 재활성화
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ 데이터베이스 초기화 완료!');
    console.log('💡 이제 create-admin.js를 실행하여 관리자 계정을 생성하세요.');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();
