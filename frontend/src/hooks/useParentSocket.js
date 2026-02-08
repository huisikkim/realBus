import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export function useParentSocket({ children, onChildrenUpdate }) {
  const [busLocation, setBusLocation] = useState(null);
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  // 소켓 이벤트 핸들러
  useEffect(() => {
    if (!socket || !connected) return;

    const handleLocationUpdate = (data) => {
      setBusLocation(data);
    };

    const handleTripStarted = () => {
      onChildrenUpdate();
    };

    const handleTripEnded = () => {
      setBusLocation(null);
      onChildrenUpdate();
    };

    const handleChildBoarded = (data) => {
      if (data.parentId === user?.id) {
        alert(`${data.childName}이(가) 버스에 탑승했습니다.`);
        onChildrenUpdate();
      }
    };

    const handleChildAlighted = (data) => {
      if (data.parentId === user?.id) {
        setBusLocation(null);
        onChildrenUpdate();
        const child = children.find(c => c.id === data.childId);
        if (child) {
          alert(`${child.name}이(가) 버스에서 하차했습니다.`);
        }
      }
    };

    const handleEmergencyAlert = (data) => {
      alert(`⚠️ 비상 알림: ${data.message}`);
    };

    socket.on('bus:locationUpdate', handleLocationUpdate);
    socket.on('bus:tripStarted', handleTripStarted);
    socket.on('bus:tripEnded', handleTripEnded);
    socket.on('child:boarded', handleChildBoarded);
    socket.on('child:alighted', handleChildAlighted);
    socket.on('emergency:alert', handleEmergencyAlert);

    return () => {
      socket.off('bus:locationUpdate', handleLocationUpdate);
      socket.off('bus:tripStarted', handleTripStarted);
      socket.off('bus:tripEnded', handleTripEnded);
      socket.off('child:boarded', handleChildBoarded);
      socket.off('child:alighted', handleChildAlighted);
      socket.off('emergency:alert', handleEmergencyAlert);
    };
  }, [socket, connected, user, children, onChildrenUpdate]);

  // 버스 구독 관리
  useEffect(() => {
    if (!socket || !connected || children.length === 0) {
      setBusLocation(null);
      return;
    }

    const boardedChildren = children.filter(c => c.bus_id && c.boarding_status === '승차');
    const busIds = [...new Set(boardedChildren.map(c => c.bus_id))];
    
    if (busIds.length === 0) {
      setBusLocation(null);
      return;
    }
    
    busIds.forEach(busId => {
      socket.emit('parent:subscribeBus', { busId });
    });

    return () => {
      busIds.forEach(busId => {
        socket.emit('parent:unsubscribeBus', { busId });
      });
    };
  }, [socket, connected, children]);

  return { busLocation, connected };
}
