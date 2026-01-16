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

  // 정류장 관련 함수
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

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['buses', 'stops', 'users', 'children'].map(t => (
            <button
              key={t}
              className={`btn ${tab === t ? 'btn-primary' : ''}`}
              style={{ flex: 1, padding: '10px', background: tab === t ? '#4F46E5' : '#e5e5e5', color: tab === t ? 'white' : '#333' }}
              onClick={() => setTab(t)}
            >
              {t === 'buses' ? '버스 관리' : t === 'stops' ? '정류장 관리' : t === 'users' ? '사용자 관리' : '아이 관리'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'buses' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px' }}>버스 목록</h2>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => openBusModal()}>
              + 버스 추가
            </button>
          </div>
          {buses.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>등록된 버스가 없습니다</p>
          ) : (
            buses.map(bus => (
              <div key={bus.id} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{bus.bus_number}호 버스</strong>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                      기사: {bus.driver_name || '미배정'} | 정원: {bus.capacity}명
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openBusModal(bus)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>수정</button>
                    <button onClick={() => deleteBus(bus.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', background: '#EF4444', color: 'white', cursor: 'pointer' }}>삭제</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>사용자 목록</h2>
          {users.map(user => (
            <div key={user.id} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{user.name}</strong>
                  <p style={{ fontSize: '13px', color: '#666' }}>{user.email}</p>
                </div>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="parent">학부모</option>
                  <option value="driver">기사</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'children' && (
        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>아이 목록</h2>
          {children.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>등록된 아이가 없습니다</p>
          ) : (
            children.map(child => (
              <div key={child.id} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong>{child.name}</strong> ({child.age}세)
                    <p style={{ fontSize: '13px', color: '#666' }}>보호자: {child.parent_name}</p>
                    {child.stop_name && <p style={{ fontSize: '12px', color: '#888' }}>정류장: {child.stop_name}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      value={child.bus_id || ''}
                      onChange={(e) => assignChildBus(child.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="">버스 미배정</option>
                      {buses.map(bus => (
                        <option key={bus.id} value={bus.id}>{bus.bus_number}호</option>
                      ))}
                    </select>
                    <select
                      value={child.stop_id || ''}
                      onChange={(e) => assignChildStop(child.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                      disabled={!child.bus_id}
                    >
                      <option value="">정류장 미배정</option>
                      {allStops.filter(s => s.bus_id === child.bus_id).map(stop => (
                        <option key={stop.id} value={stop.id}>{stop.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'stops' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '18px' }}>정류장 관리</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={selectedBusForStops}
                onChange={(e) => setSelectedBusForStops(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">버스 선택</option>
                {buses.map(bus => (
                  <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
                ))}
              </select>
              <button 
                className="btn btn-primary" 
                style={{ width: 'auto', padding: '8px 16px' }} 
                onClick={() => openStopModal()}
                disabled={!selectedBusForStops}
              >
                + 정류장 추가
              </button>
            </div>
          </div>
          
          {!selectedBusForStops ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>버스를 선택해주세요</p>
          ) : stops.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>등록된 정류장이 없습니다</p>
          ) : (
            stops.map((stop, index) => (
              <div key={stop.id} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{index + 1}. {stop.name}</strong>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                      위치: {stop.latitude}, {stop.longitude}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openStopModal(stop)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>수정</button>
                    <button onClick={() => deleteStop(stop.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', background: '#EF4444', color: 'white', cursor: 'pointer' }}>삭제</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showBusModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '16px' }}>{editingBus ? '버스 수정' : '버스 추가'}</h3>
            <input
              className="input"
              placeholder="버스 번호 (예: 1)"
              value={busForm.busNumber}
              onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
            />
            <select
              className="input"
              value={busForm.driverId}
              onChange={(e) => setBusForm({ ...busForm, driverId: e.target.value })}
            >
              <option value="">기사 선택 (선택사항)</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              placeholder="정원"
              value={busForm.capacity}
              onChange={(e) => setBusForm({ ...busForm, capacity: parseInt(e.target.value) || 15 })}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="btn" style={{ background: '#e5e5e5' }} onClick={() => setShowBusModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={saveBus}>저장</button>
            </div>
          </div>
        </div>
      )}

      {showStopModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>{editingStop ? '정류장 수정' : '정류장 추가'}</h3>
            
            <StopMapPicker
              latitude={stopForm.latitude ? parseFloat(stopForm.latitude) : null}
              longitude={stopForm.longitude ? parseFloat(stopForm.longitude) : null}
              onSelect={(lat, lng) => setStopForm({ ...stopForm, latitude: lat.toFixed(8), longitude: lng.toFixed(8) })}
            />

            <select
              className="input"
              value={stopForm.busId}
              onChange={(e) => setStopForm({ ...stopForm, busId: e.target.value })}
              disabled={editingStop}
            >
              <option value="">버스 선택</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="정류장 이름 (예: OO아파트 앞)"
              value={stopForm.name}
              onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input"
                type="number"
                step="any"
                placeholder="위도"
                value={stopForm.latitude}
                onChange={(e) => setStopForm({ ...stopForm, latitude: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                className="input"
                type="number"
                step="any"
                placeholder="경도"
                value={stopForm.longitude}
                onChange={(e) => setStopForm({ ...stopForm, longitude: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            <input
              className="input"
              type="number"
              placeholder="순서"
              value={stopForm.stopOrder}
              onChange={(e) => setStopForm({ ...stopForm, stopOrder: parseInt(e.target.value) || 0 })}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn" style={{ background: '#e5e5e5' }} onClick={() => setShowStopModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={saveStop}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
