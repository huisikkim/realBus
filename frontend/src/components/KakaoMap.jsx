import { useEffect, useRef } from 'react';

function KakaoMap({ latitude, longitude, level = 3 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // 카카오맵 스크립트 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const options = {
          center: new window.kakao.maps.LatLng(latitude || 37.5665, longitude || 126.9780),
          level: level
        };

        mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, options);

        // 마커 생성
        if (latitude && longitude) {
          markerRef.current = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(latitude, longitude),
            map: mapInstanceRef.current
          });
        }
      });
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // 위치 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;

    const newPosition = new window.kakao.maps.LatLng(latitude, longitude);

    // 지도 중심 이동
    mapInstanceRef.current.setCenter(newPosition);

    // 마커 위치 업데이트
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
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '12px',
        background: '#e0e0e0'
      }}
    />
  );
}

export default KakaoMap;
