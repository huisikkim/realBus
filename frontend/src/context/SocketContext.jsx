import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // 소켓 연결 함수
  const connectSocket = (token) => {
    // 기존 소켓이 있으면 정리
    if (socketRef.current) {
      console.log('기존 소켓 연결 종료');
      socketRef.current.close();
      socketRef.current = null;
    }

    console.log('소켓 연결 시도...');
    const newSocket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ 소켓 연결 성공');
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('소켓 연결 해제:', reason);
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
      console.log('소켓 연결 해제');
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
          console.log('토큰 변경 감지 - 소켓 재연결');
          connectSocket(newToken);
        } else {
          console.log('토큰 삭제 감지 - 소켓 연결 해제');
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
        console.log('수동 재연결 요청');
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
