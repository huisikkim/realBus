require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/bus');
const childRoutes = require('./routes/child');
const adminRoutes = require('./routes/admin');
const stopRoutes = require('./routes/stop');
const etaRoutes = require('./routes/eta');
const notificationRoutes = require('./routes/notification');
const { initSocket } = require('./socket');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);

// CORS 설정
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

console.log('CORS 설정:', corsOptions);

app.use(cors(corsOptions));
app.use(express.json());

// 헬스 체크 (가장 먼저)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io 설정
const io = new Server(server, {
  cors: corsOptions
});

initSocket(io);

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/child', childRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stop', stopRoutes);
app.use('/api/eta', etaRoutes);
app.use('/api/notification', notificationRoutes);

// 프론트엔드 정적 파일 서빙 (프로덕션 환경)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // 프론트엔드 빌드 파일 서빙
  app.use(express.static(path.join(__dirname, '../public')));
  
  // SPA 라우팅 처리 (API 경로가 아닌 모든 요청을 index.html로)
  app.get('*', (req, res) => {
    // API 경로는 제외
    if (req.path.startsWith('/api') || req.path === '/health') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV}`);
  console.log(`프론트엔드 URL: ${process.env.FRONTEND_URL}`);
});
