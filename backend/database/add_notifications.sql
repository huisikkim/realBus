-- 알림 테이블 추가
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
);
