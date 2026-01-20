import React, { useEffect, useRef, useState } from 'react';

interface KakaoMapComponentProps {
  lat: number;
  lng: number;
  itemType: string;
  description: string;
}

/**
 * ✅ 좌표 기반 Kakao 지도 컴포넌트
 * 
 * 절대 규칙:
 * - lat, lng 좌표가 단일 진실 소스(single source of truth)
 * - 주소 문자열은 절대 사용하지 않음
 * - 기본값(서울시청 등) 절대 사용 금지
 */
const KakaoMapComponent: React.FC<KakaoMapComponentProps> = ({ lat, lng, itemType, description }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ❗ 좌표 검증 - 좌표가 없으면 에러 처리
    if (!lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') {
      console.error('❌ 유효한 좌표가 필요합니다:', { lat, lng });
      setMapError(true);
      setLoading(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const loadMap = async () => {
      try {
        setLoading(true);
        setMapError(false);

        // KakaoMap API 로딩 확인
        if (typeof window.kakao === 'undefined' || typeof window.kakao.maps === 'undefined') {
          console.error('KakaoMap API가 로드되지 않았습니다.');
          setMapError(true);
          setLoading(false);
          return;
        }

        // 지도 컨테이너 확인
        if (!mapContainer.current) {
          console.error('지도 컨테이너를 찾을 수 없습니다.');
          setMapError(true);
          setLoading(false);
          return;
        }

        // ✅ 좌표로만 지도 초기화 (기본값 없음)
        const position = new window.kakao.maps.LatLng(lat, lng);
        
        const options = {
          center: position,
          level: 3
        };

        const map = new window.kakao.maps.Map(mapContainer.current, options);

        // 마커 표시
        const marker = new window.kakao.maps.Marker({
          map: map,
          position: position
        });

        // 인포윈도우 표시
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${itemType}<br>${description}</div>`
        });
        infowindow.open(map, marker);

        console.log('✅ 지도 로드 성공:', { lat, lng });
        setLoading(false);

      } catch (error) {
        console.error('❌ 지도 초기화 오류:', error);
        setMapError(true);
        setLoading(false);
      }
    };

    // KakaoMap API 로딩
    if (typeof window.kakao === 'undefined') {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=247f5d27ed9dcae0f14e8f9c4d94144b&autoload=false`;
      script.async = true;
      
      script.onload = () => {
        window.kakao.maps.load(() => {
          loadMap();
        });
      };
      
      script.onerror = () => {
        console.error('KakaoMap API 스크립트 로딩 실패');
        setMapError(true);
        setLoading(false);
      };
      
      document.head.appendChild(script);
    } else {
      window.kakao.maps.load(() => {
        loadMap();
      });
    }

    // 타임아웃 설정 (10초)
    timeoutId = setTimeout(() => {
      if (loading) {
        console.error('지도 로딩 타임아웃');
        setMapError(true);
        setLoading(false);
      }
    }, 10000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [lat, lng, itemType, description]);

  // ❌ 지도 로딩 실패 - 에러 UI 표시
  if (mapError) {
    return (
      <div style={{
        width: '100%',
        height: '300px',
        backgroundColor: '#fff5f5',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px solid #fc8181',
        borderRadius: '8px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#c53030',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '10px'
          }}>
            ⚠️
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            지도를 표시할 수 없습니다
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666'
          }}>
            유효한 위치 정보가 필요합니다
          </div>
        </div>
      </div>
    );
  }

  // 로딩 중 표시
  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '300px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666'
        }}>
          지도를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '300px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }} 
    />
  );
};

export default KakaoMapComponent;
