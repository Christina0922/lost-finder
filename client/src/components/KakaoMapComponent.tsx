import React, { useEffect, useRef, useState } from 'react';

interface KakaoMapComponentProps {
  location: string;
  itemType: string;
  description: string;
}

const KakaoMapComponent: React.FC<KakaoMapComponentProps> = ({ location, itemType, description }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let map: any = null;

    const loadMap = async () => {
      try {
        setLoading(true);
        setMapError(false);

        // KakaoMap API 로딩 확인
        if (typeof window.kakao === 'undefined') {
          console.error('KakaoMap API가 로드되지 않았습니다.');
          setMapError(true);
          setLoading(false);
          return;
        }

        // KakaoMap maps 객체 확인
        if (typeof window.kakao.maps === 'undefined') {
          console.error('KakaoMap maps 객체가 로드되지 않았습니다.');
          setMapError(true);
          setLoading(false);
          return;
        }

        // LatLng 생성자 확인
        if (typeof window.kakao.maps.LatLng !== 'function') {
          console.error('KakaoMap LatLng 생성자가 사용할 수 없습니다.');
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

        // 지도 초기화
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
          level: 3
        };

        map = new window.kakao.maps.Map(mapContainer.current, options);

        // 주소-좌표 변환 객체 생성
        const geocoder = new window.kakao.maps.services.Geocoder();

        // 주소로 좌표 검색
        geocoder.addressSearch(location, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

            // 결과값으로 받은 위치를 마커로 표시
            const marker = new window.kakao.maps.Marker({
              map: map,
              position: coords
            });

            // 인포윈도우로 장소에 대한 설명 표시
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;font-size:12px;">${itemType}<br>${description}</div>`
            });
            infowindow.open(map, marker);

            // 지도의 중심을 결과값으로 받은 위치로 이동
            map.setCenter(coords);
          } else {
            console.error('주소 검색 실패:', status);
            setMapError(true);
          }
          setLoading(false);
        });

        // 타임아웃 설정 (10초)
        timeoutId = setTimeout(() => {
          if (loading) {
            console.error('지도 로딩 타임아웃');
            setMapError(true);
            setLoading(false);
          }
        }, 10000);

      } catch (error) {
        console.error('지도 초기화 오류:', error);
        setMapError(true);
        setLoading(false);
      }
    };

    // KakaoMap API 로딩
    if (typeof window.kakao === 'undefined') {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false`;
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

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [location, itemType, description]);

  // 지도 로딩 실패 시 fallback UI
  if (mapError) {
    return (
      <div style={{
        width: '100%',
        height: '300px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333'
          }}>
            지도를 불러올 수 없습니다.
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666'
          }}>
            인터넷 상태를 확인하거나, 잠시 후 다시 시도해 주세요.
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