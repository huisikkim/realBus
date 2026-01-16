import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import KakaoMap from '../components/KakaoMap';

function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [buses, setBuses] = useState([]);
  const [busLocation, setBusLocation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [childForm, setChildForm] = useState({ name: '', age: '', busId: '', stopName: '' });
  const { socket, connected } = useSocket();

  useEffect(() => {
    loadChildren();
    loadBuses();
  }, []);

  useEffect(() => {
    if (!socket || children.length === 0) return;

    const busIds = [...new Set(children.map(c => c.bus_id).filter(Boolean))];
    busIds.forEach(busId => {
      socket.emit('parent:subscribeBus', { busId });
    });

    socket.on('bus:locationUpdate', (data) => {
      setBusLocation(data);
    });

    socket.on('bus:tripStarted', () => {
      loadChildren();
    });

    socket.on('bus:tripEnded', () => {
      setBusLocation(null);
      loadChildren();
    });

    socket.on('child:boarded', (data) => {
      const child = children.find(c => c.id === data.childId);
      if (child) alert(`${child.name}이(가) 버스에 탑승했습니다.`);
    });

    socket.on('child:alighted', (data) => {
      const child = children.find(c => c.id === data.childId);
      if (child) alert(`${child.name}이(가) 버스에서 하차했습니다.`);
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
  }, [socket, children]);

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
        stopName: childForm.stopName || null
      });
      setShowAddModal(false);
      setChildForm({ name: '', age: '', busId: '', stopName: '' });
      loadChildren();
    } catch (err) {
      alert('등록 실패');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px' }}>버스 위치</h2>
          <span className={`status-badge ${connected ? 'status-running' : 'status-waiting'}`}>
            {connected ? '연결됨' : '연결 중...'}
          </span>
        </div>

        {busLocation ? (
          <>
            <KakaoMap latitude={busLocation.latitude} longitude={busLocation.longitude} />
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <p style={{ fontSize: '13px', color: '#666' }}>
                속도: {busLocation.speed || 0} km/h
              </p>
            </div>
          </>
        ) : (
          <div className="map-container">
            <p style={{ color: '#999' }}>버스가 운행 중이 아닙니다</p>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px' }}>내 아이</h2>
          <button 
            className="btn btn-primary" 
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={() => setShowAddModal(true)}
          >
            + 아이 등록
          </button>
        </div>
        
        {children.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            등록된 아이가 없습니다
          </p>
        ) : (
          children.map(child => (
            <div key={child.id} className="child-card">
              <div className="child-avatar">
                {child.name.charAt(0)}
              </div>
              <div className="child-info">
                <h3>{child.name} ({child.age}세)</h3>
                <p>
                  {child.bus_number ? `${child.bus_number}호 버스` : '버스 미배정'} 
                  {child.stop_name && ` · ${child.stop_name}`}
                </p>
                {child.bus_status && (
                  <span className={`status-badge ${child.bus_status === '운행중' ? 'status-running' : 'status-waiting'}`}>
                    {child.bus_status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        className="emergency-btn"
        onClick={() => {
          if (confirm('비상 알림을 보내시겠습니까?')) {
            const busId = children[0]?.bus_id;
            if (busId && socket) {
              socket.emit('emergency', { busId, message: '부모 비상 호출' });
              alert('비상 알림이 전송되었습니다.');
            } else {
              alert('배정된 버스가 없습니다.');
            }
          }
        }}
      >
        🚨
      </button>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '16px' }}>아이 등록</h3>
            <input
              className="input"
              placeholder="아이 이름"
              value={childForm.name}
              onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
            />
            <input
              className="input"
              type="number"
              placeholder="나이"
              value={childForm.age}
              onChange={(e) => setChildForm({ ...childForm, age: e.target.value })}
            />
            <select
              className="input"
              value={childForm.busId}
              onChange={(e) => setChildForm({ ...childForm, busId: e.target.value })}
            >
              <option value="">버스 선택 (선택사항)</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="정류장 이름 (선택사항)"
              value={childForm.stopName}
              onChange={(e) => setChildForm({ ...childForm, stopName: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="btn" style={{ background: '#e5e5e5' }} onClick={() => setShowAddModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleAddChild}>등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentDashboard;
