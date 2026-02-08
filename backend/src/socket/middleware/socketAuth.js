const jwt = require('jsonwebtoken');

/**
 * 소켓 인증 미들웨어
 */
function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('인증이 필요합니다'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('유효하지 않은 토큰입니다'));
  }
}

module.exports = { socketAuthMiddleware };
