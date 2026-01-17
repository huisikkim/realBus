require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAiven() {
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
      rejectUnauthorized: false // Aiven 자체 서명 인증서 허용
    };
  }

  console.log('Aiven MySQL 연결 시도...\n');

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('✅ DB 연결 성공\n');

    // 테이블 목록 조회
    const [tables] = await connection.execute('SHOW TABLES');
    
    console.log('📋 데이터베이스 테이블 목록:');
    console.log('================================');
    
    if (tables.length === 0) {
      console.log('❌ 테이블이 없습니다. setup-aiven.js를 실행해주세요.\n');
    } else {
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`${index + 1}. ${tableName}`);
      });
      console.log(`\n총 ${tables.length}개의 테이블\n`);

      // 각 테이블의 구조 확인
      console.log('📊 테이블 상세 정보:');
      console.log('================================\n');

      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        
        console.log(`📌 ${tableName}:`);
        columns.forEach(col => {
          console.log(`   - ${col.Field} (${col.Type}) ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 레코드 수 확인
        const [count] = await connection.execute(`SELECT COUNT(*) as cnt FROM ${tableName}`);
        console.log(`   레코드 수: ${count[0].cnt}개\n`);
      }
    }

    await connection.end();
    console.log('✅ 확인 완료');

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
    if (err.code === 'ENOTFOUND') {
      console.error('호스트를 찾을 수 없습니다. DB_HOST를 확인해주세요.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('접근이 거부되었습니다. 사용자명과 비밀번호를 확인해주세요.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('연결이 거부되었습니다. 포트와 방화벽 설정을 확인해주세요.');
    }
  }
}

checkAiven();
