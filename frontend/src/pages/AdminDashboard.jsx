import { useState, useEffect } from 'react';
import api from '../services/api';
import StopMapPicker from '../components/StopMapPicker';

function AdminDashboard() {
  const [tab, setTab] = useState('buses');
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [children, setChildren] = useState([]);
  const [stops, setStops] = useState([]);
  const [allStops, setAllStops] = useState([]);
  const [showBusModal, setShowBusModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [editingStop, setEditingStop] = useState(null);
  const [busForm, setBusForm] = useState({ busNumber: '', driverId: '', capacity: 15 });
  const [stopForm, setStopForm] = useState({ busId: '', name: '', latitude: '', longitude: '', stopOrder: 0 });
  const [selectedBusForStops, setSelectedBusForStops] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, busesRes, driversRes, childrenRes, stopsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/buses'),
        api.get('/admin/drivers'),
        api.get('/admin/children'),
        api.get('/admin/stops')
      ]);
      setUsers(usersRes.data);
      setBuses(busesRes.data);
      setDrivers(driversRes.data);
      setChildren(childrenRes.data);
      setAllStops(stopsRes.data);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    }
  };

  useEffect(() => {
    if (selectedBusForStops) {
      loadBusStops(selectedBusForStops);
    }
  }, [selectedBusForStops]);

  const loadBusStops = async (busId) => {
    try {
      const res = await api.get(`/stop/bus/${busId}`);
      setStops(res.data);
    } catch (err) {
      console.error('정류장 로드 실패:', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      loadData();
    } catch (err) {
      alert('역할 변경 실패');
    }
  };

  const openBusModal = (bus = null) => {
    if (bus) {
      setEditingBus(bus);
      setBusForm({ busNumber: bus.bus_number, driverId: bus.driver_id || '', capacity: bus.capacity });
    } else {
      setEditingBus(null);
      setBusForm({ busNumber: '', driverId: '', capacity: 15 });
    }
    setShowBusModal(true);
  };

  const saveBus = async () => {
    try {
      if (editingBus) {
        await api.put(`/admin/buses/${editingBus.id}`, busForm);
      } else {
        await api.post('/admin/buses', busForm);
      }
      setShowBusModal(false);
      loadData();
    } catch (err) {
      alert('저장 실패');
    }
  };

  const deleteBus = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/admin/buses/${id}`);
      loadData();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  const openStopModal = (stop = null) => {
    if (stop) {
      setEditingStop(stop);
      setStopForm({
        busId: stop.bus_id,
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopOrder: stop.stop_order
      });
    } else {
      setEditingStop(null);
      setStopForm({
        busId: selectedBusForStops || '',
        name: '',
        latitude: '',
        longitude: '',
        stopOrder: stops.length
      });
    }
    setShowStopModal(true);
  };

  const saveStop = async () => {
    if (!stopForm.busId || !stopForm.name || !stopForm.latitude || !stopForm.longitude) {
      alert('모든 필드를 입력해주세요');
      return;
    }
    try {
      if (editingStop) {
        await api.put(`/stop/${editingStop.id}`, stopForm);
      } else {
        await api.post('/stop', stopForm);
      }
      setShowStopModal(false);
      loadData();
      if (selectedBusForStops) loadBusStops(selectedBusForStops);
    } catch (err) {
      alert('저장 실패');
    }
  };

  const deleteStop = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/stop/${id}`);
      loadData();
      if (selectedBusForStops) loadBusStops(selectedBusForStops);
    } catch (err) {
      alert('삭제 실패');
    }
  };

  const assignChildBus = async (childId, busId) => {
    try {
      await api.put(`/admin/children/${childId}/bus`, { busId: busId || null });
      loadData();
    } catch (err) {
      alert('배정 실패');
    }
  };

  const assignChildStop = async (childId, stopId) => {
    try {
      await api.put(`/admin/children/${childId}/stop`, { stopId: stopId || null });
      loadData();
    } catch (err) {
      alert('정류장 배정 실패');
    }
  };

  const tabs = [
    { id: 'buses', label: '버스 관리', icon: 'directions_bus' },
    { id: 'stops', label: '정류장 관리', icon: 'location_on' },
    { id: 'users', label: '사용자 관리', icon: 'group' },
    { id: 'children', label: '아이 관리', icon: 'child_care' }
  ];

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">
      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                tab === t.id
                  ? 'bg-navy text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 버스 관리 */}
      {tab === 'buses' && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-navy">버스 목록</h2>
              <p className="text-slate-500 font-medium text-sm">등록된 버스를 관리합니다.</p>
            </div>
            <button
              onClick={() => openBusModal()}
              className="bg-navy hover:bg-navy-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              버스 추가
            </button>
          </div>

          {buses.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">directions_bus</span>
              <p className="text-slate-500 font-semibold">등록된 버스가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buses.map(bus => (
                <div key={bus.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-navy text-white rounded-xl flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined">directions_bus</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold text-navy">{bus.bus_number}호 버스</h4>
                      <p className="text-slate-500 text-sm font-medium">
                        기사: {bus.driver_name || '미배정'} · 정원: {bus.capacity}명
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openBusModal(bus)}
                      className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteBus(bus.id)}
                      className="px-4 py-2 rounded-lg bg-action-red hover:bg-red-600 text-white font-bold text-sm transition-all"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 정류장 관리 */}
      {tab === 'stops' && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-navy">정류장 관리</h2>
              <p className="text-slate-500 font-medium text-sm">버스별 정류장을 등록하고 관리합니다.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={selectedBusForStops}
                onChange={(e) => setSelectedBusForStops(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 font-medium bg-white focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none"
              >
                <option value="">버스 선택</option>
                {buses.map(bus => (
                  <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
                ))}
              </select>
              <button
                onClick={() => openStopModal()}
                disabled={!selectedBusForStops}
                className="bg-navy hover:bg-navy-dark disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-lg">add_location</span>
                <span className="hidden sm:inline">정류장 추가</span>
              </button>
            </div>
          </div>

          {!selectedBusForStops ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">map</span>
              <p className="text-slate-500 font-semibold">버스를 선택해주세요</p>
            </div>
          ) : stops.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">location_off</span>
              <p className="text-slate-500 font-semibold">등록된 정류장이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={stop.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-safe-green text-white rounded-full flex items-center justify-center font-black text-lg shadow-md">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold text-navy">{stop.name}</h4>
                      <p className="text-slate-400 text-xs font-medium">
                        {parseFloat(stop.latitude).toFixed(6)}, {parseFloat(stop.longitude).toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openStopModal(stop)}
                      className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteStop(stop.id)}
                      className="px-4 py-2 rounded-lg bg-action-red hover:bg-red-600 text-white font-bold text-sm transition-all"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 사용자 관리 */}
      {tab === 'users' && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy">사용자 목록</h2>
            <p className="text-slate-500 font-medium text-sm">사용자 역할을 관리합니다.</p>
          </div>

          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy text-white rounded-xl flex items-center justify-center text-lg font-black shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-navy">{user.name}</h4>
                    <p className="text-slate-500 text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm border-2 outline-none transition-all ${
                    user.role === 'admin' 
                      ? 'border-action-red bg-red-50 text-action-red'
                      : user.role === 'driver'
                      ? 'border-safe-green bg-emerald-50 text-safe-green'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <option value="parent">학부모</option>
                  <option value="driver">기사</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 아이 관리 */}
      {tab === 'children' && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy">아이 목록</h2>
            <p className="text-slate-500 font-medium text-sm">아이의 버스와 정류장을 배정합니다.</p>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">child_care</span>
              <p className="text-slate-500 font-semibold">등록된 아이가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {children.map(child => (
                <div key={child.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-navy text-white rounded-xl flex items-center justify-center text-lg font-black shadow-md">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-extrabold text-navy">{child.name}</h4>
                          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{child.age}세</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">보호자: {child.parent_name}</p>
                        {child.stop_name && (
                          <p className="text-slate-400 text-xs font-medium flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {child.stop_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={child.bus_id || ''}
                        onChange={(e) => assignChildBus(child.id, e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 font-medium text-sm bg-white focus:border-navy outline-none"
                      >
                        <option value="">버스 미배정</option>
                        {buses.map(bus => (
                          <option key={bus.id} value={bus.id}>{bus.bus_number}호</option>
                        ))}
                      </select>
                      <select
                        value={child.stop_id || ''}
                        onChange={(e) => assignChildStop(child.id, e.target.value)}
                        disabled={!child.bus_id}
                        className="px-3 py-2 rounded-lg border border-slate-200 font-medium text-sm bg-white focus:border-navy outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">정류장 미배정</option>
                        {allStops.filter(s => s.bus_id === child.bus_id).map(stop => (
                          <option key={stop.id} value={stop.id}>{stop.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 버스 추가/수정 모달 */}
      {showBusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-navy">{editingBus ? '버스 수정' : '버스 추가'}</h3>
              <button
                onClick={() => setShowBusModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">버스 번호</label>
                <input
                  type="text"
                  placeholder="예: 1"
                  value={busForm.busNumber}
                  onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">기사 배정</label>
                <select
                  value={busForm.driverId}
                  onChange={(e) => setBusForm({ ...busForm, driverId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none font-medium bg-white"
                >
                  <option value="">기사 선택 (선택사항)</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">정원</label>
                <input
                  type="number"
                  value={busForm.capacity}
                  onChange={(e) => setBusForm({ ...busForm, capacity: parseInt(e.target.value) || 15 })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowBusModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                취소
              </button>
              <button
                onClick={saveBus}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-navy hover:bg-navy-dark transition-all shadow-md"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정류장 추가/수정 모달 */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-navy">{editingStop ? '정류장 수정' : '정류장 추가'}</h3>
              <button
                onClick={() => setShowStopModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            <StopMapPicker
              latitude={stopForm.latitude ? parseFloat(stopForm.latitude) : null}
              longitude={stopForm.longitude ? parseFloat(stopForm.longitude) : null}
              onSelect={(lat, lng) => setStopForm({ ...stopForm, latitude: lat.toFixed(8), longitude: lng.toFixed(8) })}
            />

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">버스</label>
                <select
                  value={stopForm.busId}
                  onChange={(e) => setStopForm({ ...stopForm, busId: e.target.value })}
                  disabled={editingStop}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none font-medium bg-white disabled:bg-slate-100"
                >
                  <option value="">버스 선택</option>
                  {buses.map(bus => (
                    <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">정류장 이름</label>
                <input
                  type="text"
                  placeholder="예: OO아파트 앞"
                  value={stopForm.name}
                  onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">위도</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="37.5665"
                    value={stopForm.latitude}
                    onChange={(e) => setStopForm({ ...stopForm, latitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">경도</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="126.9780"
                    value={stopForm.longitude}
                    onChange={(e) => setStopForm({ ...stopForm, longitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">순서</label>
                <input
                  type="number"
                  value={stopForm.stopOrder}
                  onChange={(e) => setStopForm({ ...stopForm, stopOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowStopModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                취소
              </button>
              <button
                onClick={saveStop}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-navy hover:bg-navy-dark transition-all shadow-md"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
