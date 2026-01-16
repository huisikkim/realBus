-- 셔틀버스 안전 서비스 DB 스키마

-- 사용자 테이블
CREATE TABLE shuttle_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('parent', 'driver', 'admin') DEFAULT 'parent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 버스 테이블
CREATE TABLE buses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_number VARCHAR(20) NOT NULL,
  driver_id INT,
  capacity INT DEFAULT 15,
  status ENUM('대기', '운행중') DEFAULT '대기',
  current_trip_start TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES shuttle_users(id)
);

-- 아이 테이블
CREATE TABLE children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INT,
  bus_id INT,
  stop_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES shuttle_users(id),
  FOREIGN KEY (bus_id) REFERENCES buses(id)
);

-- 위치 기록 테이블
CREATE TABLE location_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id),
  INDEX idx_bus_time (bus_id, created_at)
);

-- 승하차 기록 테이블
CREATE TABLE boarding_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  bus_id INT NOT NULL,
  type ENUM('승차', '하차') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (bus_id) REFERENCES buses(id),
  INDEX idx_child_time (child_id, created_at)
);

-- 비상 알림 기록 테이블
CREATE TABLE emergency_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id),
  FOREIGN KEY (user_id) REFERENCES shuttle_users(id)
);
