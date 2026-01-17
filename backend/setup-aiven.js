require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupAiven() {
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

  console.log('Aiven MySQL 연결 시도:', {
    host: connectionConfig.host,
    port: connectionConfig.port,
    database: connectionConfig.database,
    ssl: !!connectionConfig.ssl
  });

  const connection = await mysql.createConnection(connectionConfig);
  console.log('✅ DB 연결 성공\n');

  try {
    // 전체 스키마 생성
    console.log('📋 스키마 생성 시작...\n');

    // 1. 사용자 테이블
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shuttle_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role ENUM('parent', 'driver', 'admin') DEFAULT 'parent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ shuttle_users 테이블 생성');

    // 2. 버스 테이블
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS buses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_number VARCHAR(20) NOT NULL,
        driver_id INT,
        capacity INT DEFAULT 15,
        status ENUM('대기', '운행중') DEFAULT '대기',
        current_trip_start TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ buses 테이블 생성');

    // 3. 정류장 테이블
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        stop_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_bus_order (bus_id, stop_order)
      )
    `);
    console.log('✅ stops 테이블 생성');

    // 4. 아이 테이블
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS children (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        age INT,
        bus_id INT,
        stop_id INT,
        stop_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ children 테이블 생성');

    // 5. 위치 기록 테이블
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS location_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_id INT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        speed DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_bus_time (bus_id, created_at)
      )
    `);
    console.log('✅ location_history 테이블 생성');

    // 6. 승하차 기록 테이블
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS boarding_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        child_id INT NOT NULL,
        bus_id INT NOT NULL,
        type ENUM('승차', '하차') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_child_time (child_id, created_at)
      )
    `);
    console.log('✅ boarding_log 테이블 생성');

    // 7. 비상 알림 기록 테이블
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS emergency_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ emergency_log 테이블 생성');

    console.log('\n📌 Foreign Key 추가 중...\n');

    // Foreign Key 추가 (이미 있으면 무시)
    const foreignKeys = [
      { table: 'buses', column: 'driver_id', ref: 'shuttle_users(id)', onDelete: 'SET NULL' },
      { table: 'stops', column: 'bus_id', ref: 'buses(id)', onDelete: 'CASCADE' },
      { table: 'children', column: 'parent_id', ref: 'shuttle_users(id)', onDelete: 'CASCADE' },
      { table: 'children', column: 'bus_id', ref: 'buses(id)', onDelete: 'SET NULL' },
      { table: 'children', column: 'stop_id', ref: 'stops(id)', onDelete: 'SET NULL' },
      { table: 'location_history', column: 'bus_id', ref: 'buses(id)', onDelete: 'CASCADE' },
      { table: 'boarding_log', column: 'child_id', ref: 'children(id)', onDelete: 'CASCADE' },
      { table: 'boarding_log', column: 'bus_id', ref: 'buses(id)', onDelete: 'CASCADE' },
      { table: 'emergency_log', column: 'bus_id', ref: 'buses(id)', onDelete: 'CASCADE' },
      { table: 'emergency_log', column: 'user_id', ref: 'shuttle_users(id)', onDelete: 'CASCADE' }
    ];

    for (const fk of foreignKeys) {
      try {
        await connection.execute(`
          ALTER TABLE ${fk.table} 
          ADD FOREIGN KEY (${fk.column}) 
          REFERENCES ${fk.ref} 
          ON DELETE ${fk.onDelete}
        `);
        console.log(`✅ ${fk.table}.${fk.column} FK 추가`);
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_FK_DUP_NAME' || err.code === 'ER_CANT_CREATE_TABLE') {
          console.log(`⏭️  ${fk.table}.${fk.column} FK 이미 존재 (스킵)`);
        } else {
          console.error(`❌ ${fk.table}.${fk.column} FK 추가 실패:`, err.message);
        }
      }
    }

    console.log('\n🎉 Aiven MySQL 설정 완료!');
    console.log('이제 백엔드 서버를 시작할 수 있습니다: npm run dev\n');

  } catch (err) {
    console.error('\n❌ 오류 발생:', err.message);
    console.error('상세:', err);
  } finally {
    await connection.end();
  }
}

setupAiven();
