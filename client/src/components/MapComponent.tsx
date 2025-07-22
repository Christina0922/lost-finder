import React, { useEffect, useRef, useState } from 'react';

interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  marker?: {
    position: { lat: number; lng: number };
    title: string;
    description?: string;
  };
}

// 카카오맵 API 키
const KAKAO_MAP_API_KEY = '247f5d27ed9dcae0f14e8f9c4d94144b';

const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 37.5665, lng: 126.9780 }, // 서울 시청 좌표
  zoom = 15, // 더 적절한 줌 레벨
  marker
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('MapComponent 마운트됨');
    console.log('API 키:', KAKAO_MAP_API_KEY);

    // 카카오맵 API 로드 함수
    const loadKakaoMap = () => {
      console.log('카카오맵 API 로드 시작');
      
      // 이미 로드된 스크립트가 있는지 확인
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
      if (existingScript) {
        console.log('카카오맵 스크립트 이미 존재함');
        // 기존 스크립트가 있으면 바로 초기화 시도
        setTimeout(() => {
          if (window.kakao && window.kakao.maps) {
            console.log('카카오맵 API 사용 가능');
            setMapLoaded(true);
            initMap();
          } else {
            console.log('기존 스크립트가 있지만 API가 로드되지 않음');
            setError('카카오맵 API 로드 실패');
          }
        }, 2000); // 2초 대기
        return;
      }

      // 새로운 스크립트 로드
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services`;
      script.async = true;
      
      script.onload = () => {
        console.log('카카오맵 스크립트 로드 성공');
        // 스크립트 로드 후 바로 초기화 시도
        setTimeout(() => {
          if (window.kakao && window.kakao.maps) {
            console.log('카카오맵 API 로드 완료');
            setMapLoaded(true);
            initMap();
          } else {
            console.error('스크립트는 로드되었지만 API가 사용 불가');
            setError('카카오맵 API 초기화 실패');
          }
        }, 2000); // 2초 대기
      };
      
      script.onerror = (e) => {
        console.error('카카오맵 스크립트 로드 실패:', e);
        setError('카카오맵 스크립트 로드 실패');
      };
      
      document.head.appendChild(script);
    };

    // 카카오맵 API 로드 시작
    loadKakaoMap();
  }, []);

  const initMap = () => {
    console.log('지도 초기화 시작');
    
    if (!mapRef.current) {
      console.error('맵 컨테이너가 없음');
      setError('맵 컨테이너 오류');
      return;
    }

    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 API가 로드되지 않음');
      setError('카카오맵 API 로드 실패');
      return;
    }

    try {
      console.log('카카오맵 인스턴스 생성 시작');
      
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: zoom
      });

      console.log('카카오맵 인스턴스 생성 성공');

      if (marker) {
        console.log('마커 추가 시작');
        
        const markerPosition = new window.kakao.maps.LatLng(
          marker.position.lat,
          marker.position.lng
        );

        const kakaoMarker = new window.kakao.maps.Marker({
          position: markerPosition,
          map: map,
          title: marker.title
        });

        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:10px;"><strong>${marker.title}</strong><br/>${marker.description || ''}</div>`
        });

        infoWindow.open(map, kakaoMarker);
        
        console.log('마커 추가 완료');
      }
      
      console.log('지도 초기화 완료');
    } catch (error) {
      console.error('카카오맵 초기화 오류:', error);
      setError('카카오맵 초기화 실패');
      setMapLoaded(false);
    }
  };

  // 오류가 있을 때
  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        backgroundColor: '#fff3cd',
        border: '2px solid #ffeaa7',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#856404'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
        <div style={{ fontSize: '16px', textAlign: 'center' }}>
          지도 로드 실패<br/>
          <small>{error}</small><br/>
          <small>위도: {center.lat.toFixed(4)}, 경도: {center.lng.toFixed(4)}</small>
        </div>
        {marker && (
          <div style={{
            marginTop: '10px',
            background: '#ff6b35',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            📍 {marker.title}
          </div>
        )}
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 로딩 중일 때
  if (!mapLoaded) {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px', color: '#6c757d' }}>
          🗺️
        </div>
        <div style={{ fontSize: '16px', color: '#6c757d', textAlign: 'center' }}>
          카카오맵 로딩 중...<br/>
          <small>위도: {center.lat.toFixed(4)}, 경도: {center.lng.toFixed(4)}</small>
        </div>
        {marker && (
          <div style={{
            marginTop: '10px',
            background: '#ff6b35',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            📍 {marker.title}
          </div>
        )}
      </div>
    );
  }

  // 실제 카카오맵
  return (
    <div style={{ width: '100%', height: '400px', borderRadius: '10px', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapComponent; 