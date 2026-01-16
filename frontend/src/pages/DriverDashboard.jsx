import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import KakaoMap from '../components/KakaoMap';

function DriverDashboard() {
  const [bus, setBus] = useState(null);
  const [children, setChildren] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
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
      setIsRunning(bus.status === '운행중');
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

    // GPS 추적 시작
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
          alert('GPS를 사용할 수 없습니다. 위치 권한을 확인해주세요.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
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
    } else {
      socket.emit('driver:childAlighted', { childId, busId: bus.id });
      alert('하차 처리되었습니다.');
    }
  };

  if (!bus) {
    return (
      <div className="container">
        <div className="card text-center" style={{ padding: '40px' }}>
          <p style={{ color: '#666' }}>배정된 버스가 없습니다.</p>
          <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
            관리자에게 문의해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px' }}>{bus.bus_number}호 버스</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>정원: {bus.capacity}명</p>
          </div>
          <span className={`status-badge ${isRunning ? 'status-running' : 'status-waiting'}`}>
            {isRunning ? '운행중' : '대기'}
          </span>
        </div>

        {currentLocation && (
          <>
            <KakaoMap latitude={currentLocation.latitude} longitude={currentLocation.longitude} />
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <p style={{ fontSize: '13px', color: '#0369a1' }}>
                속도: {currentLocation.speed} km/h
              </p>
            </div>
          </>
        )}

        {!isRunning ? (
          <button className="btn btn-success" onClick={startTrip}>
            🚌 운행 시작
          </button>
        ) : (
          <button className="btn btn-danger" onClick={endTrip}>
            운행 종료
          </button>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>
          탑승 아이 목록 ({children.length}명)
        </h2>

        {children.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            등록된 아이가 없습니다
          </p>
        ) : (
          children.map(child => (
            <div key={child.id} className="child-card" style={{ flexWrap: 'wrap' }}>
              <div className="child-avatar">
                {child.name.charAt(0)}
              </div>
              <div className="child-info" style={{ flex: 1 }}>
                <h3>{child.name}</h3>
                <p>{child.stop_name || '정류장 미지정'}</p>
                <p style={{ fontSize: '12px' }}>보호자: {child.parent_name} ({child.parent_phone})</p>
              </div>
              {isRunning && (
                <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
                  <button
                    className="btn btn-success"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => handleBoarding(child.id, 'board')}
                  >
                    승차
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => handleBoarding(child.id, 'alight')}
                  >
                    하차
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button 
        className="emergency-btn"
        onClick={() => {
          if (confirm('비상 알림을 모든 부모에게 보내시겠습니까?')) {
            if (socket) {
              socket.emit('emergency', { busId: bus.id, message: '기사 비상 호출' });
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

export default DriverDashboard;
