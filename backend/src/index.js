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
const { initSocket } = require('./socket');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);

// CORS 설정
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

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

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
