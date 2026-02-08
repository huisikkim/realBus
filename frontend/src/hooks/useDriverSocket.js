import { useEffect } from 'react';

/**
 * 기사 관련 소켓 이벤트를 관리하는 커스텀 훅
 */
export function useDriverSocket(socket, bus) {
  useEffect(() => {
    if (!socket) return;

    // 비상 알림 수신
    const handleEmergencyAlert = (data) => {
      alert(`⚠️ 비상 알림: ${data.message}`);
    };

    socket.on('emergency:alert', handleEmergencyAlert);

    return () => {
      socket.off('emergency:alert', handleEmergencyAlert);
    };
  }, [socket]);

  const startTrip = () => {
    if (!bus || !socket) {
      console.error('버스 정보 또는 소켓이 없습니다.');
      return false;
    }

    console.log('운행 시작 이벤트 전송');
    socket.emit('driver:startTrip', { busId: bus.id });
    return true;
  };

  const endTrip = () => {
    if (!bus || !socket) {
      console.error('버스 정보 또는 소켓이 없습니다.');
      return false;
    }

    console.log('운행 종료 - 버스 ID:', bus.id);
    socket.emit('driver:endTrip', { busId: bus.id });
    return true;
  };

  const handleBoarding = (childId, type) => {
    if (!bus || !socket) {
      console.error('버스 정보 또는 소켓이 없습니다.');
      return false;
    }

    if (type === 'board') {
      console.log('승차 처리:', childId, bus.id);
      socket.emit('driver:childBoarded', { childId, busId: bus.id });
    } else {
      console.log('하차 처리:', childId, bus.id);
      socket.emit('driver:childAlighted', { childId, busId: bus.id });
    }

    return true;
  };

  return {
    startTrip,
    endTrip,
    handleBoarding
  };
}
