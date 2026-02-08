import { useEffect, useRef, useState } from 'react';

function StopMapPicker({ latitude, longitude, onSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);

  // 현재 위치 가져오기
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setCurrentPosition({ lat: 37.5665, lng: 126.9780 }); // 서울 시청
        }
      );
    } else {
      setCurrentPosition({ lat: 37.5665, lng: 126.9780 });
    }
  }, []);

  useEffect(() => {
    if (!currentPosition) return;

    // 이미 카카오맵이 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap();
      });
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [currentPosition]);

  const initMap = () => {
    if (!mapRef.current || !currentPosition) return;

    // 기존 좌표가 있으면 그 위치로, 없으면 현재 위치로
    const initialLat = latitude || currentPosition.lat;
    const initialLng = longitude || currentPosition.lng;

    const options = {
      center: new window.kakao.maps.LatLng(initialLat, initialLng),
      level: 3
    };

    mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, options);

    // 현재 위치 마커 (파란색)
    const currentMarkerImage = new window.kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
      new window.kakao.maps.Size(24, 35)
    );
    
    currentMarkerRef.current = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng),
      map: mapInstanceRef.current,
      image: currentMarkerImage,
      title: '현재 위치'
    });

    // 선택된 정류장 마커 (기존 좌표가 있으면)
    if (latitude && longitude) {
      markerRef.current = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(latitude, longitude),
        map: mapInstanceRef.current
      });
    }

    // 지도 클릭 이벤트
    window.kakao.maps.event.addListener(mapInstanceRef.current, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      const lat = latlng.getLat();
      const lng = latlng.getLng();

      // 마커 업데이트
      if (markerRef.current) {
        markerRef.current.setPosition(latlng);
      } else {
        markerRef.current = new window.kakao.maps.Marker({
          position: latlng,
          map: mapInstanceRef.current
        });
      }

      // 부모 컴포넌트에 좌표 전달
      onSelect(lat, lng);
    });

    setIsLoaded(true);
  };

  // 외부에서 좌표가 변경되면 마커 위치 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;

    const newPosition = new window.kakao.maps.LatLng(latitude, longitude);

    if (markerRef.current) {
      markerRef.current.setPosition(newPosition);
    } else {
      markerRef.current = new window.kakao.maps.Marker({
        position: newPosition,
        map: mapInstanceRef.current
      });
    }
  }, [latitude, longitude]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '250px',
          borderRadius: '8px',
          background: '#e0e0e0',
          marginBottom: '8px'
        }}
      />
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
          borderRadius: '8px'
        }}>
          {currentPosition ? '지도 로딩 중...' : '현재 위치 확인 중...'}
        </div>
      )}
      <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
        🗺️ 지도를 클릭하여 정류장 위치를 선택하세요 (⭐ 현재 위치)
      </p>
    </div>
  );
}

export default StopMapPicker;
