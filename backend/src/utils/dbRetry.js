// 데이터베이스 쿼리 재시도 유틸리티
async function executeWithRetry(queryFn, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (err) {
      lastError = err;
      
      // ECONNRESET 등 연결 오류인 경우 재시도
      if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        if (attempt < maxRetries) {
          console.log(`DB 쿼리 재시도 ${attempt}/${maxRetries}... (${err.code})`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
      }
      
      // 다른 오류는 즉시 throw
      throw err;
    }
  }

  // 모든 재시도 실패
  throw lastError;
}

module.exports = { executeWithRetry };
