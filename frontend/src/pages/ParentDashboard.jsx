import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import KakaoMap from '../components/KakaoMap';

function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [buses, setBuses] = useState([]);
  const [busLocation, setBusLocation] = useState(null);
  const [etaData, setEtaData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [childForm, setChildForm] = useState({ name: '', age: '', busId: '', stopId: '' });
  const [stops, setStops] = useState([]);
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    loadChildren();
    loadBuses();
  }, []);

  // ETA 주기적 업데이트
  useEffect(() => {
    // 승차 중인 아이가 없거나 버스 위치가 없으면 ETA 조회 안함
    const boardedChildren = children.filter(c => c.boarding_status === '승차');
    if (boardedChildren.length === 0 || !busLocation) {
      setEtaData({});
      return;
    }

    const fetchEta = async () => {
      const etaResults = {};
      for (const child of boardedChildren) {
        if (child.bus_id && child.stop_id) {
          try {
            const res = await api.get(`/eta/child/${child.id}`);
            etaResults[child.id] = res.data;
          } catch (err) {
            // 버스가 운행 중이 아니면 에러 무시
            if (err.response?.status !== 500) {
              console.error('ETA 조회 실패:', err);
            }
          }
        }
      }
      setEtaData(etaResults);
    };

    fetchEta();
    const interval = setInterval(fetchEta, 30000); // 30초마다 갱신

    return () => clearInterval(interval);
  }, [children, busLocation]);

  // 버스 선택 시 해당 버스의 정류장 로드
  useEffect(() => {
    if (childForm.busId) {
      loadStops(childForm.busId);
    } else {
      setStops([]);
    }
  }, [childForm.busId]);

  useEffect(() => {
    if (!socket || !connected) return;

    // 소켓 이벤트 리스너 등록
    const handleLocationUpdate = (data) => {
      setBusLocation(data);
    };

    const handleTripStarted = (data) => {
      loadChildren();
    };

    const handleTripEnded = (data) => {
      setBusLocation(null);
      loadChildren();
    };

    const handleChildBoarded = async (data) => {
      // 내 아이인지 확인
      if (data.parentId === user?.id) {
        alert(`${data.childName}이(가) 버스에 탑승했습니다.`);
        
        try {
          const res = await api.get('/child/my');
          setChildren(res.data);
        } catch (err) {
          console.error('아이 정보 로드 실패:', err);
          loadChildren();
        }
      }
    };

    const handleChildAlighted = async (data) => {
      // 내 아이가 하차한 경우
      if (data.parentId === user?.id) {
        setBusLocation(null);
        
        try {
          const res = await api.get('/child/my');
          const updatedChildren = res.data;
          setChildren(updatedChildren);
          
          const child = updatedChildren.find(c => c.id === data.childId);
          if (child) {
            alert(`${child.name}이(가) 버스에서 하차했습니다.`);
          }
        } catch (err) {
          console.error('아이 정보 로드 실패:', err);
          loadChildren();
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
  }, [socket, connected, user]);

  // 버스 구독 관리 (children 상태가 변경될 때마다 실행)
  useEffect(() => {
    if (!socket || !connected || children.length === 0) {
      setBusLocation(null);
      return;
    }

    // 승차 상태인 아이만 필터링 (오늘 마지막 기록이 '승차'인 경우)
    const boardedChildren = children.filter(c => c.bus_id && c.boarding_status === '승차');
    const busIds = [...new Set(boardedChildren.map(c => c.bus_id))];
    
    // 승차 중인 아이가 없으면 위치 공유 중단
    if (busIds.length === 0) {
      setBusLocation(null);
      return;
    }
    
    // 버스 구독 (각 버스마다)
    busIds.forEach(busId => {
      socket.emit('parent:subscribeBus', { busId });
    });

    // cleanup: 구독 해제
    return () => {
      busIds.forEach(busId => {
        socket.emit('parent:unsubscribeBus', { busId });
      });
    };
  }, [socket, connected, children]);

  const loadChildren = async () => {
    try {
      const res = await api.get('/child/my');
      setChildren(res.data);
    } catch (err) {
      console.error('아이 목록 로드 실패:', err);
    }
  };

  const loadBuses = async () => {
    try {
      const res = await api.get('/bus');
      setBuses(res.data);
    } catch (err) {
      console.error('버스 목록 로드 실패:', err);
    }
  };

  const loadStops = async (busId) => {
    try {
      const res = await api.get(`/stop/bus/${busId}`);
      setStops(res.data);
    } catch (err) {
      console.error('정류장 목록 로드 실패:', err);
    }
  };

  const handleAddChild = async () => {
    if (!childForm.name || !childForm.age) {
      alert('이름과 나이를 입력해주세요');
      return;
    }
    try {
      await api.post('/child', {
        name: childForm.name,
        age: parseInt(childForm.age),
        busId: childForm.busId || null,
        stopId: childForm.stopId || null
      });
      setShowAddModal(false);
      setChildForm({ name: '', age: '', busId: '', stopId: '' });
      loadChildren();
    } catch (err) {
      alert('등록 실패');
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-4 pb-20">
      {/* 버스 위치 섹션 - 인스타 스토리 스타일 */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden border-0">
        <div className="relative w-full aspect-[4/3] max-h-[400px]">
          {busLocation && children.some(c => c.boarding_status === '승차') ? (
            <>
              <KakaoMap latitude={busLocation.latitude} longitude={busLocation.longitude} />
              {/* 상단 그라데이션 오버레이 */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent"></div>
              {/* 하단 그라데이션 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* 상단 정보 */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                      <span className="text-base">🚌</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold text-xs drop-shadow-lg">실시간 위치</p>
                    <p className="text-white/80 text-[10px] drop-shadow-lg">지금 운행 중</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md ${
                  connected ? 'bg-emerald-500/90' : 'bg-slate-500/90'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-white ${connected ? 'animate-pulse' : ''}`}></span>
                  <span className="text-white text-[10px] font-bold">LIVE</span>
                </div>
              </div>

              {/* 하단 정보 */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl p-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-lg">speed</span>
                      <span className="text-slate-900 dark:text-white font-bold text-sm">{busLocation.speed || 0} km/h</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">실시간 추적 중</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">location_off</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-bold text-base mb-1">
                  {children.length === 0 
                    ? '아이를 등록해주세요'
                    : children.some(c => c.bus_id) 
                      ? '탑승 대기 중'
                      : '버스 배정 필요'
                  }
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">
                  {children.some(c => c.bus_id) 
                    ? '탑승하면 실시간으로 위치를 확인할 수 있어요'
                    : '아이에게 버스를 배정해주세요'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 내 아이 섹션 - 인스타 피드 스타일 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">내 아이</h3>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 font-bold text-sm hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span>추가</span>
          </button>
        </div>

        {children.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-pink-400 dark:text-pink-500">child_care</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-bold mb-2">아직 등록된 아이가 없어요</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">아이를 등록하고 버스를 배정해보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map(child => (
              <div key={child.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden">
                {/* 카드 헤더 */}
                <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg ${
                      child.boarding_status === '승차' 
                        ? 'bg-gradient-to-br from-pink-500 to-orange-400' 
                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                    }`}>
                      {child.name.charAt(0)}
                    </div>
                    {child.boarding_status === '승차' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{child.name}</h4>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">·</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{child.age}세</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                      {child.bus_number ? `${child.bus_number}호 버스` : '버스 미배정'}
                    </p>
                  </div>
                  {child.boarding_status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      child.boarding_status === '승차' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {child.boarding_status}
                    </span>
                  )}
                </div>

                {/* 카드 본문 */}
                {child.stop_name && (
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg mt-0.5">location_on</span>
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">{child.stop_name}</p>
                        {/* ETA 표시 - 승차 중일 때만 */}
                        {child.boarding_status === '승차' && etaData[child.id]?.eta && (
                          <div className="mt-2 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2">
                            <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg">schedule</span>
                            <div>
                              <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                                약 {etaData[child.id].eta}분 후 도착
                              </p>
                              <p className="text-amber-500/70 dark:text-amber-400/70 text-xs">
                                {(etaData[child.id].distance / 1000).toFixed(1)}km 남음
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 아이 등록 모달 - 인스타 스타일 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl animate-slide-up md:animate-none">
            {/* 모달 헤더 */}
            <div className="relative p-4 border-b border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">close</span>
              </button>
              <h3 className="text-center text-base font-bold text-slate-900 dark:text-white">새 아이 등록</h3>
            </div>
            
            {/* 모달 본문 */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">아이 이름</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all font-medium"
                  placeholder="이름을 입력하세요"
                  value={childForm.name}
                  onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">나이</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all font-medium"
                  placeholder="나이를 입력하세요"
                  value={childForm.age}
                  onChange={(e) => setChildForm({ ...childForm, age: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">버스 선택</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all font-medium"
                  value={childForm.busId}
                  onChange={(e) => setChildForm({ ...childForm, busId: e.target.value })}
                >
                  <option value="">선택 안 함 (나중에 배정)</option>
                  {buses.map(bus => (
                    <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">정류장 선택</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all font-medium disabled:opacity-50"
                  value={childForm.stopId}
                  onChange={(e) => setChildForm({ ...childForm, stopId: e.target.value })}
                  disabled={!childForm.busId}
                >
                  <option value="">{childForm.busId ? '선택 안 함' : '버스를 먼저 선택하세요'}</option>
                  {stops.map(stop => (
                    <option key={stop.id} value={stop.id}>{stop.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button 
                onClick={handleAddChild}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ParentDashboard;
