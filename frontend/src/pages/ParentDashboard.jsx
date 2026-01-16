import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import KakaoMap from '../components/KakaoMap';

function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [busLocation, setBusLocation] = useState(null);
  const [busStatus, setBusStatus] = useState(null);
  const { socket, connected } = useSocket();

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (!socket || children.length === 0) return;

    // 아이가 탑승한 버스 구독
    const busIds = [...new Set(children.map(c => c.bus_id).filter(Boolean))];
    busIds.forEach(busId => {
      socket.emit('parent:subscribeBus', { busId });
    });

    // 위치 업데이트 수신
    socket.on('bus:locationUpdate', (data) => {
      setBusLocation(data);
    });

    // 운행 시작/종료 수신
    socket.on('bus:tripStarted', (data) => {
      setBusStatus({ ...data, status: '운행중' });
    });

    socket.on('bus:tripEnded', (data) => {
      setBusStatus({ ...data, status: '대기' });
      setBusLocation(null);
    });

    // 승하차 알림
    socket.on('child:boarded', (data) => {
      const child = children.find(c => c.id === data.childId);
      if (child) {
        alert(`${child.name}이(가) 버스에 탑승했습니다.`);
      }
    });

    socket.on('child:alighted', (data) => {
      const child = children.find(c => c.id === data.childId);
      if (child) {
        alert(`${child.name}이(가) 버스에서 하차했습니다.`);
      }
    });

    // 비상 알림
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
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>내 아이</h2>
        
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
                <h3>{child.name}</h3>
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
            }
          }
        }}
      >
        🚨
      </button>
    </div>
  );
}

export default ParentDashboard;
