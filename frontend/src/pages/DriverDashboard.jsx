import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useBusManagement } from '../hooks/useBusManagement';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { useDriverSocket } from '../hooks/useDriverSocket';
import BusInfoCard from '../components/BusInfoCard';
import TripControls from '../components/TripControls';
import ChildrenList from '../components/ChildrenList';

/**
 * 기사 대시보드 메인 컴포넌트
 * - 버스 정보 표시
 * - 실시간 위치 추적
 * - 운행 시작/종료
 * - 어린이 승하차 관리
 */
function DriverDashboard() {
  const { socket, connected } = useSocket();
  const { bus, children, loading } = useBusManagement();
  const { currentLocation, startTracking, stopTracking } = useDriverLocation(socket, bus);
  const { startTrip, endTrip, handleBoarding } = useDriverSocket(socket, bus);

  const [isRunning, setIsRunning] = useState(false);
  const [hiddenButtons, setHiddenButtons] = useState({});
  const [currentPassengers, setCurrentPassengers] = useState(0);

  const handleStartTrip = () => {
    if (!bus) {
      alert('버스 정보를 불러오는 중입니다.');
      return;
    }

    if (!socket || !connected) {
      alert('서버와 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const trackingStarted = startTracking();
    if (trackingStarted) {
      startTrip();
      setIsRunning(true);
    }
  };

  const handleEndTrip = () => {
    if (!bus) {
      alert('버스 정보를 불러오는 중입니다.');
      return;
    }

    if (!socket || !connected) {
      alert('서버와 연결되지 않았습니다.');
      return;
    }

    stopTracking();
    endTrip();
    setIsRunning(false);
    setCurrentPassengers(0);
    setHiddenButtons({});
  };

  const handleChildBoarding = (childId, type) => {
    if (!bus) {
      alert('버스 정보를 불러오는 중입니다.');
      return;
    }

    if (!socket || !connected) {
      alert('서버와 연결되지 않았습니다.');
      return;
    }

    const success = handleBoarding(childId, type);
    if (success) {
      if (type === 'board') {
        alert('승차 처리되었습니다.');
        setHiddenButtons(prev => ({ ...prev, [`${childId}-board`]: true }));
        setCurrentPassengers(prev => prev + 1);
      } else {
        alert('하차 처리되었습니다.');
        setHiddenButtons(prev => ({ ...prev, [`${childId}-alight`]: true }));
        setCurrentPassengers(prev => Math.max(0, prev - 1));
      }
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-10">
        <section className="bg-white dark:bg-slate-800 rounded-large shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 animate-pulse">directions_bus</span>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">버스 정보를 불러오는 중...</p>
          </div>
        </section>
      </main>
    );
  }

  // 버스 없음
  if (!bus) {
    return (
      <main className="max-w-5xl mx-auto p-10">
        <section className="bg-white dark:bg-slate-800 rounded-large shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">directions_bus</span>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">배정된 버스가 없습니다.</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">관리자에게 문의해주세요.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      {/* 버스 정보 & 지도 */}
      <BusInfoCard
        bus={bus}
        isRunning={isRunning}
        connected={connected}
        currentLocation={currentLocation}
        currentPassengers={currentPassengers}
      />

      {/* 운행 제어 버튼 */}
      <TripControls
        isRunning={isRunning}
        connected={connected}
        onStartTrip={handleStartTrip}
        onEndTrip={handleEndTrip}
      />

      {/* 어린이 목록 */}
      <ChildrenList
        children={children}
        isRunning={isRunning}
        currentPassengers={currentPassengers}
        hiddenButtons={hiddenButtons}
        onBoarding={handleChildBoarding}
      />
    </main>
  );
}

export default DriverDashboard;
