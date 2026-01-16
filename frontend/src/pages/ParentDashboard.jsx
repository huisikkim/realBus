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
    if (children.length === 0 || !busLocation) return;

    const fetchEta = async () => {
      const etaResults = {};
      for (const child of children) {
        if (child.bus_id && child.stop_id) {
          try {
            const res = await api.get(`/eta/child/${child.id}`);
            etaResults[child.id] = res.data;
          } catch (err) {
            console.error('ETA 조회 실패:', err);
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
    if (!socket || !connected || children.length === 0) return;

    // 버스가 배정된 모든 아이의 버스를 구독 (하차 완료된 경우만 제외)
    const childrenWithBus = children.filter(c => c.bus_id);
    const busIds = [...new Set(childrenWithBus.map(c => c.bus_id))];
    
    console.log('아이 목록:', children);
    console.log('버스 구독 시도:', busIds);
    
    if (busIds.length === 0) {
      console.log('구독할 버스 없음 (버스 미배정)');
      return;
    }
    
    busIds.forEach(busId => {
      console.log('버스 구독:', busId);
      socket.emit('parent:subscribeBus', { busId });
    });

    socket.on('bus:locationUpdate', (data) => {
      console.log('위치 업데이트 수신:', data);
      setBusLocation(data);
    });

    socket.on('bus:tripStarted', (data) => {
      console.log('운행 시작:', data);
      loadChildren();
    });

    socket.on('bus:tripEnded', (data) => {
      console.log('운행 종료:', data);
      setBusLocation(null);
      loadChildren();
    });

    socket.on('child:boarded', (data) => {
      const child = children.find(c => c.id === data.childId);
      if (child) {
        alert(`${child.name}이(가) 버스에 탑승했습니다.`);
        loadChildren();
      }
    });

    socket.on('child:alighted', (data) => {
      const child = children.find(c => c.id === data.childId);
      if (child) {
        alert(`${child.name}이(가) 버스에서 하차했습니다.`);
        loadChildren();
      }
    });

    socket.on('emergency:alert', (data) => {
      alert(`⚠️ 비상 알림: ${data.message}`);
    });

    return () => {
      busIds.forEach(busId => {
        socket.emit('parent:unsubscribeBus', { busId });
      });
      socket.off('bus:locationUpdate');
      socket.off('bus:tripStarted');
      socket.off('bus:tripEnded');
      socket.off('child:boarded');
      socket.off('child:alighted');
      socket.off('emergency:alert');
    };
  }, [socket, connected, children.length]); // children.length로 변경하여 무한 루프 방지

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
    <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      {/* 버스 위치 섹션 */}
      <section className="bg-white rounded-large shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-navy">실시간 버스 위치</h2>
              <p className="text-slate-500 font-medium text-sm">우리 아이가 탑승한 버스의 현재 위치입니다.</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              connected ? 'bg-emerald-50 text-safe-green' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-safe-green animate-pulse' : 'bg-slate-400'}`}></span>
              {connected ? '연결됨' : '연결 중...'}
            </div>
          </div>

          <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
            {busLocation ? (
              <>
                <KakaoMap latitude={busLocation.latitude} longitude={busLocation.longitude} />
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-safe-green rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-navy">속도: {busLocation.speed || 0} km/h</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">location_off</span>
                  <p className="text-slate-500 font-semibold">버스가 운행 중이 아닙니다</p>
                  <p className="text-slate-400 text-sm mt-1">운행이 시작되면 위치가 표시됩니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 내 아이 섹션 */}
      <section className="bg-white rounded-large shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-navy">내 아이</h3>
            <p className="text-slate-500 font-medium text-sm">등록된 아이의 탑승 상태를 확인하세요.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-navy hover:bg-navy-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md shadow-navy/10"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            아이 등록
          </button>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">child_care</span>
            <p className="text-slate-500 font-semibold">등록된 아이가 없습니다</p>
            <p className="text-slate-400 text-sm mt-1">아이를 등록하고 버스를 배정해주세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map(child => (
              <div key={child.id} className="bg-slate-50 rounded-2xl p-5 md:p-6 border border-slate-100 flex items-center gap-4 md:gap-6 hover:border-slate-200 transition-all">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-navy text-white rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black shadow-md flex-shrink-0">
                  {child.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-lg md:text-xl font-extrabold text-navy">{child.name}</h4>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{child.age}세</span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm truncate">
                    {child.bus_number ? `${child.bus_number}호 버스` : '버스 미배정'}
                    {child.stop_name && ` · ${child.stop_name}`}
                  </p>
                  {/* ETA 표시 */}
                  {etaData[child.id]?.eta && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-amber-500">schedule</span>
                      <span className="text-amber-600 font-bold text-sm">
                        약 {etaData[child.id].eta}분 후 도착 예정
                      </span>
                      <span className="text-slate-400 text-xs">
                        ({(etaData[child.id].distance / 1000).toFixed(1)}km)
                      </span>
                    </div>
                  )}
                </div>
                {child.bus_status && (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 ${
                    child.bus_status === '운행중' 
                      ? 'bg-emerald-50 text-safe-green border border-emerald-100' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {child.bus_status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 아이 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-navy">아이 등록</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">아이 이름</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none transition-all font-medium"
                  placeholder="이름을 입력하세요"
                  value={childForm.name}
                  onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">나이</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none transition-all font-medium"
                  placeholder="나이를 입력하세요"
                  value={childForm.age}
                  onChange={(e) => setChildForm({ ...childForm, age: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">버스 선택</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none transition-all font-medium bg-white"
                  value={childForm.busId}
                  onChange={(e) => setChildForm({ ...childForm, busId: e.target.value })}
                >
                  <option value="">버스를 선택하세요 (선택사항)</option>
                  {buses.map(bus => (
                    <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">정류장 선택</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none transition-all font-medium bg-white"
                  value={childForm.stopId}
                  onChange={(e) => setChildForm({ ...childForm, stopId: e.target.value })}
                  disabled={!childForm.busId}
                >
                  <option value="">{childForm.busId ? '정류장을 선택하세요' : '버스를 먼저 선택하세요'}</option>
                  {stops.map(stop => (
                    <option key={stop.id} value={stop.id}>{stop.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleAddChild}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-navy hover:bg-navy-dark transition-all shadow-md shadow-navy/10"
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
