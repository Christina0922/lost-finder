import React, { useEffect, useRef, useState } from 'react';
import config from '../config';

interface KakaoMapComponentProps {
  location: string;
  itemType: string;
  description: string;
  coords?: { lat: number; lng: number } | null;
}

const KakaoMapComponent: React.FC<KakaoMapComponentProps> = ({ location, itemType, description, coords }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const loadMap = () => {
      try {
        console.log('🗺️ 지도 로드 시작:', { location, coords, itemType });
        
        if (!isMounted) return;

        // 지도 컨테이너 확인
        if (!mapContainer.current) {
          console.error('❌ 지도 컨테이너를 찾을 수 없습니다.');
          if (isMounted) {
            setMapError(true);
            setLoading(false);
          }
          return;
        }

        // KakaoMap API 로딩 확인 - API가 없으면 기본 지도라도 표시
        if (typeof window.kakao === 'undefined' || typeof window.kakao.maps === 'undefined') {
          console.warn('⚠️ KakaoMap API가 아직 로드되지 않았습니다. 잠시 후 다시 시도합니다.');
          // API가 없어도 기본 지도 컨테이너는 표시
          if (isMounted) {
            setLoading(false);
            // 에러로 표시하지 않고 기본 컨테이너 유지
          }
          return;
        }

        // LatLng 생성자 확인
        if (typeof window.kakao.maps.LatLng !== 'function') {
          console.warn('⚠️ KakaoMap LatLng 생성자가 아직 사용할 수 없습니다.');
          if (isMounted) {
            setLoading(false);
            // 에러로 표시하지 않고 기본 컨테이너 유지
          }
          return;
        }

        // 좌표가 있으면 바로 사용, 없으면 기본 위치
        const centerLat = coords ? coords.lat : 37.5665;
        const centerLng = coords ? coords.lng : 126.9780;
        const defaultCenter = new window.kakao.maps.LatLng(centerLat, centerLng);

        console.log('📍 지도 중심 좌표:', { lat: centerLat, lng: centerLng });

        // 기존 지도가 있으면 제거
        if (mapInstanceRef.current) {
          mapInstanceRef.current = null;
        }

        // 지도 초기화
        const options = {
          center: defaultCenter,
          level: 3
        };

        const map = new window.kakao.maps.Map(mapContainer.current, options);
        mapInstanceRef.current = map;
        console.log('✅ 지도 초기화 완료');

        // 좌표가 있으면 바로 마커 표시
        if (coords) {
          console.log('📍 좌표로 마커 표시:', coords);
          const mapCoords = new window.kakao.maps.LatLng(coords.lat, coords.lng);
          
          // 마커 표시
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: mapCoords
          });

          // 인포윈도우로 장소에 대한 설명 표시
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;min-width:150px;"><strong>${itemType || '분실물'}</strong><br/>${description || location || ''}</div>`
          });
          infowindow.open(map, marker);

          // 지도의 중심을 좌표로 이동
          map.setCenter(mapCoords);
          console.log('✅ 마커 표시 완료');
        } else if (location && location.trim()) {
          console.log('🔍 주소로 검색 시도:', location);
          // 좌표가 없으면 주소로 검색 시도
          const geocoder = new window.kakao.maps.services.Geocoder();
          
          // 타임아웃 설정 (10초)
          timeoutId = setTimeout(() => {
            console.error('위치 검색 타임아웃');
            if (isMounted) {
              setLoading(false);
            }
          }, 10000);

          // 주소 검색 시도
          geocoder.addressSearch(location.trim(), (result: any, status: any) => {
            if (!isMounted) return;
            
            // 타임아웃 클리어
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            
            if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
              const mapCoords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
              
              // 마커 표시
              const marker = new window.kakao.maps.Marker({
                map: map,
                position: mapCoords
              });

              // 인포윈도우로 장소에 대한 설명 표시
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;min-width:150px;"><strong>${itemType || '분실물'}</strong><br/>${description || location || ''}</div>`
              });
              infowindow.open(map, marker);

              // 지도의 중심을 결과값으로 받은 위치로 이동
              map.setCenter(mapCoords);
              console.log('✅ 주소 검색 성공, 마커 표시 완료');
            } else {
              console.log('📍 주소 검색 실패, 기본 위치 유지');
            }
            
            if (isMounted) {
              setLoading(false);
            }
          });
        } else {
          // 주소가 없으면 기본 위치만 표시
          console.log('📍 주소가 없어 기본 위치(서울 시청)를 표시합니다.');
        }

        // 지도 로딩 완료
        if (isMounted) {
          setLoading(false);
          setMapError(false);
        }

      } catch (error) {
        console.error('❌ 지도 초기화 오류:', error);
        if (isMounted) {
          setMapError(true);
          setLoading(false);
        }
      }
    };

    // KakaoMap API 로딩 및 지도 초기화
    const initMap = () => {
      // API가 이미 로드되어 있으면 바로 사용
      if (typeof window.kakao !== 'undefined' && window.kakao.maps) {
        console.log('✅ 카카오맵 API 이미 로드됨');
        // maps.load가 필요할 수 있음
        if (window.kakao.maps.load) {
          window.kakao.maps.load(() => {
            console.log('✅ 카카오맵 API 초기화 완료');
            loadMap();
          });
        } else {
          loadMap();
        }
        return;
      }

      // API가 없으면 스크립트 로드
      console.log('⏳ 카카오맵 API 스크립트 로드 중...');
      const script = document.createElement('script');
      const apiKey = process.env.REACT_APP_KAKAO_MAP_API_KEY || config.kakaoMapApiKey || '';
      if (!apiKey) {
        console.error('❌ 카카오맵 API 키가 설정되지 않았습니다.');
        if (isMounted) {
          setMapError(true);
          setLoading(false);
        }
        return;
      }
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
      script.async = true;
      
      script.onload = () => {
        console.log('✅ 카카오맵 스크립트 로드 완료');
        if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
          window.kakao.maps.load(() => {
            console.log('✅ 카카오맵 API 초기화 완료');
            if (isMounted) {
              loadMap();
            }
          });
        } else if (window.kakao && window.kakao.maps) {
          // load 함수가 없으면 바로 사용
          if (isMounted) {
            loadMap();
          }
        } else {
          console.error('❌ 카카오맵 API 초기화 실패');
          if (isMounted) {
            setMapError(true);
            setLoading(false);
          }
        }
      };
      
      script.onerror = () => {
        console.error('❌ 카카오맵 스크립트 로딩 실패');
        if (isMounted) {
          setMapError(true);
          setLoading(false);
        }
      };
      
      document.head.appendChild(script);
    };

    // DOM이 완전히 렌더링된 후 초기화
    const timer = setTimeout(() => {
      initMap();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [location, itemType, description, coords]);

  // 지도 컨테이너는 항상 표시 (로딩 중이거나 에러가 있어도)
  // API가 로드되면 자동으로 지도가 표시됨
  return (
    <div style={{ position: 'relative', width: '100%', height: '300px' }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          border: '1px solid #ddd',
          backgroundColor: loading ? '#f5f5f5' : 'transparent'
        }} 
      />
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          지도를 불러오는 중...
        </div>
      )}
      {mapError && !loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px 20px',
          borderRadius: '8px',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          지도를 불러오는 중...
        </div>
      )}
    </div>
  );
};

export default KakaoMapComponent; 