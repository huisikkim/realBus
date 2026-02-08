import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// 프로덕션에서는 같은 서버 사용 (상대 경로)
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // 소켓 연결 함수
  const connectSocket = (token) => {
    // 기존 소켓이 있으면 정리
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const newSocket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('소켓 연결 오류:', error.message);
      setConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  // 소켓 연결 해제 함수
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    }
  };

  // 초기 연결
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  // 토큰 변화 감지 (storage 이벤트)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const newToken = e.newValue;
        if (newToken) {
          connectSocket(newToken);
        } else {
          disconnectSocket();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 전역 함수로 노출 (로그인 시 호출용)
  useEffect(() => {
    window.reconnectSocket = () => {
      const token = localStorage.getItem('token');
      if (token) {
        connectSocket(token);
      }
    };

    return () => {
      delete window.reconnectSocket;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
