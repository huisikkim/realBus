import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import KakaoMap from '../components/KakaoMap';

function DriverDashboard() {
  const [bus, setBus] = useState(null);
  const [children, setChildren] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hiddenButtons, setHiddenButtons] = useState({}); // 버튼 숨김 상태 관리
  const { socket, connected } = useSocket();
  const watchIdRef = useRef(null);

  useEffect(() => {
    loadMyBus();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (bus) {
      loadBusChildren(bus.id);
      // DB 상태가 '운행중'이어도 실제로는 종료된 상태일 수 있으므로
      // 로그인 시에는 항상 '대기' 상태로 시작
      setIsRunning(false);
      
      // 만약 DB에 '운행중'으로 남아있다면 '대기'로 초기화
      if (bus.status === '운행중') {
        api.put(`/bus/${bus.id}/status`, { status: '대기' }).catch(err => {
          console.error('버스 상태 초기화 실패:', err);
        });
      }
    }
  }, [bus]);

  useEffect(() => {
    if (!socket) return;

    socket.on('emergency:alert', (data) => {
      alert(`⚠️ 비상 알림: ${data.message}`);
    });

    return () => {
      socket.off('emergency:alert');
    };
  }, [socket]);

  const loadMyBus = async () => {
    try {
      const res = await api.get('/bus/my/assigned');
      if (res.data.length > 0) {
        setBus(res.data[0]);
      }
    } catch (err) {
      console.error('버스 로드 실패:', err);
    }
  };

  const loadBusChildren = async (busId) => {
    try {
      const res = await api.get(`/bus/${busId}/children`);
      setChildren(res.data);
    } catch (err) {
      console.error('아이 목록 로드 실패:', err);
    }
  };

  const startTrip = () => {
    if (!bus || !socket) return;

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const locationData = {
            busId: bus.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0
          };
          setCurrentLocation(locationData);
          socket.emit('driver:updateLocation', locationData);
        },
        (error) => {
          console.error('GPS 오류:', error);
          const defaultLocation = {
            busId: bus.id,
            latitude: 37.5665,
            longitude: 126.9780,
            speed: 0
          };
          setCurrentLocation(defaultLocation);
          socket.emit('driver:updateLocation', defaultLocation);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000
        }
      );

      socket.emit('driver:startTrip', { busId: bus.id });
      setIsRunning(true);
    } else {
      alert('이 브라우저는 GPS를 지원하지 않습니다.');
    }
  };

  const endTrip = () => {
    if (!bus || !socket) return;

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    socket.emit('driver:endTrip', { busId: bus.id });
    setIsRunning(false);
    setCurrentLocation(null);
  };

  const handleBoarding = (childId, type) => {
    if (!bus || !socket) return;

    if (type === 'board') {
      socket.emit('driver:childBoarded', { childId, busId: bus.id });
      alert('승차 처리되었습니다.');
      // 승차 버튼 숨기기
      setHiddenButtons(prev => ({ ...prev, [`${childId}-board`]: true }));
    } else {
      socket.emit('driver:childAlighted', { childId, busId: bus.id });
      alert('하차 처리되었습니다.');
      // 하차 버튼 숨기기
      setHiddenButtons(prev => ({ ...prev, [`${childId}-alight`]: true }));
    }
  };

  if (!bus) {
    return (
      <main className="max-w-5xl mx-auto p-10">
        <section className="bg-white rounded-large shadow-sm border border-slate-200 p-8">
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">directions_bus</span>
            <p className="text-slate-500 font-semibold text-lg">배정된 버스가 없습니다.</p>
            <p className="text-slate-400 text-sm mt-2">관리자에게 문의해주세요.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      {/* 버스 정보 & 지도 섹션 */}
      <section className="bg-white rounded-large shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-navy">{bus.bus_number}호 버스</h2>
                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                  isRunning 
                    ? 'bg-emerald-50 text-safe-green border-emerald-100' 
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {isRunning ? '운행중' : '대기'}
                </span>
              </div>
              <p className="text-slate-500 font-semibold text-sm">최대 정원: {bus.capacity}명 | 현재 탑승: {children.length}명</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-widest">현재 속도</p>
              <p className="text-3xl md:text-4xl font-black text-navy">
                {currentLocation?.speed || 0} <span className="text-lg font-bold text-slate-400">km/h</span>
              </p>
            </div>
          </div>

          {/* 지도 */}
          <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-8 border border-slate-200 shadow-inner">
            {currentLocation ? (
              <KakaoMap latitude={currentLocation.latitude} longitude={currentLocation.longitude} />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">map</span>
                  <p className="text-slate-400 font-medium">운행을 시작하면 지도가 표시됩니다</p>
                </div>
              </div>
            )}
            {currentLocation && (
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-safe-green rounded-full animate-pulse"></span>
                GPS Active | Kakao Map
              </div>
            )}
          </div>

          {/* 운행 버튼 */}
          <div className="flex justify-center">
            {!isRunning ? (
              <button 
                onClick={startTrip}
                className="w-full max-w-md bg-safe-green hover:bg-emerald-600 text-white py-4 md:py-5 rounded-xl font-extrabold text-lg md:text-xl transition-all shadow-lg shadow-emerald-100 active:scale-[0.99] flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined font-bold text-2xl">play_circle</span>
                운행 시작
              </button>
            ) : (
              <button 
                onClick={endTrip}
                className="w-full max-w-md bg-rose-400 hover:bg-rose-500 text-white py-4 md:py-5 rounded-xl font-extrabold text-lg md:text-xl transition-all shadow-lg shadow-rose-100 active:scale-[0.99] flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined font-bold text-2xl">stop_circle</span>
                운행 종료
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 탑승 어린이 섹션 */}
      <section className="bg-white rounded-large shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-8">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-navy">탑승 어린이 목록</h3>
            <p className="text-slate-500 font-medium text-sm">실시간 탑승 및 하차 상태를 관리하세요.</p>
          </div>
          <span className="text-slate-400 text-sm font-bold">총 {children.length}명</span>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">child_care</span>
            <p className="text-slate-400 font-medium">등록된 어린이가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map(child => (
              <div key={child.id} className="bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-200 transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-navy text-white rounded-2xl flex items-center justify-center text-xl md:text-3xl font-black shadow-md">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg md:text-2xl font-extrabold text-navy">{child.name}</h4>
                      {child.stop_name && (
                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{child.stop_name}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                        <span className="material-symbols-outlined text-base">person</span>
                        보호자: {child.parent_name}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                        <span className="material-symbols-outlined text-base">call</span>
                        {child.parent_phone || '연락처 없음'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {isRunning && (
                  <div className="flex gap-3 w-full md:w-auto">
                    {!hiddenButtons[`${child.id}-board`] && (
                      <button 
                        onClick={() => handleBoarding(child.id, 'board')}
                        className="flex-1 md:flex-none bg-white hover:bg-emerald-50 text-safe-green border-2 border-emerald-500 px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold md:font-black text-base md:text-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-xl md:text-2xl font-bold">login</span>
                        승차
                      </button>
                    )}
                    {!hiddenButtons[`${child.id}-alight`] && (
                      <button 
                        onClick={() => handleBoarding(child.id, 'alight')}
                        className="flex-1 md:flex-none bg-navy hover:bg-navy-dark text-white border-2 border-navy px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold md:font-black text-base md:text-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-navy/10"
                      >
                        <span className="material-symbols-outlined text-xl md:text-2xl font-bold">logout</span>
                        하차
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default DriverDashboard;
