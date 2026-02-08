import { useState, useRef } from 'react';

/**
 * GPS 위치 추적을 관리하는 커스텀 훅
 * 기사의 실시간 위치를 추적하고 업데이트합니다.
 */
export function useDriverLocation(socket, bus) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const watchIdRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const lastValidLocationRef = useRef(null);
  const gpsErrorCountRef = useRef(0);

  const startTracking = () => {
    if (!bus || !socket) {
      console.error('버스 정보 또는 소켓이 없습니다.');
      return false;
    }

    if (!('geolocation' in navigator)) {
      alert('이 브라우저는 GPS를 지원하지 않습니다.');
      return false;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

        // 최소 5초 간격으로만 업데이트
        if (timeSinceLastUpdate < 5000) {
          return;
        }

        // GPS 정확도 체크
        const accuracy = position.coords.accuracy;
        if (accuracy > 100) {
          console.warn(`GPS 정확도 낮음 (${accuracy}m) - 업데이트 건너뜀`);
          return;
        }

        lastUpdateTimeRef.current = now;
        gpsErrorCountRef.current = 0;

        const locationData = {
          busId: bus.id,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0
        };

        lastValidLocationRef.current = locationData;
        setCurrentLocation(locationData);
        socket.emit('driver:updateLocation', locationData);
      },
      (error) => {
        gpsErrorCountRef.current++;
        console.error(`GPS 오류 (${gpsErrorCountRef.current}회):`, error.code, error.message);

        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'GPS 신호를 찾을 수 없습니다. 잠시 후 다시 시도됩니다.';
            break;
          case error.TIMEOUT:
            errorMessage = 'GPS 응답 시간 초과. 계속 시도 중입니다.';
            break;
        }

        if (gpsErrorCountRef.current === 1) {
          console.warn(errorMessage);
        }

        if (lastValidLocationRef.current) {
          setCurrentLocation(lastValidLocationRef.current);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
        distanceFilter: 10
      }
    );

    return true;
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    lastValidLocationRef.current = null;
    gpsErrorCountRef.current = 0;
    setCurrentLocation(null);
  };

  return {
    currentLocation,
    startTracking,
    stopTracking
  };
}
