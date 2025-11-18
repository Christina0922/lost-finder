import React, { useEffect, useRef, useState } from 'react';
import config from '../config';
import { API_BASE } from '../utils/api';

interface KakaoMapComponentProps {
  location: string;
  itemType: string;
  description: string;
  coords?: { lat: number; lng: number } | null;
}

declare global {
  interface Window {
    kakao: any;
  }
}

const KakaoMapComponent: React.FC<KakaoMapComponentProps> = ({ location, itemType, description, coords }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    let intervals: NodeJS.Timeout[] = [];

    const clearAllIntervals = () => {
      intervals.forEach(interval => clearInterval(interval));
      intervals = [];
    };

    const loadMap = () => {
      if (!isMounted || !mapContainer.current) {
        return;
      }

      try {
        if (typeof window.kakao === 'undefined' || 
            !window.kakao?.maps || 
            typeof window.kakao.maps.LatLng !== 'function' ||
            typeof window.kakao.maps.Map !== 'function') {
          return;
        }

        // 기존 지도 제거
        if (mapInstanceRef.current) {
          mapInstanceRef.current = null;
        }

        // 좌표가 있으면 바로 지도 생성
        if (coords) {
          const center = new window.kakao.maps.LatLng(coords.lat, coords.lng);
          const map = new window.kakao.maps.Map(mapContainer.current, {
            center: center,
            level: 3
          });
          mapInstanceRef.current = map;

          const marker = new window.kakao.maps.Marker({
            map: map,
            position: new window.kakao.maps.LatLng(coords.lat, coords.lng)
          });
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;"><strong>${itemType || '분실물'}</strong><br/>${description || location || ''}</div>`
          });
          infowindow.open(map, marker);
          map.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng));

          if (isMounted) {
            setLoading(false);
            setMapError(false);
          }
        } else if (location && location.trim()) {
          // 주소가 있으면 서버 geocode API를 먼저 시도 (한글 주소 검색 정확도 향상)
          const searchAddress = async () => {
            try {
              // 서버 geocode API 호출 (한글 주소 검색에 최적화)
              const geocodeUrl = `${API_BASE}/api/geocode?address=${encodeURIComponent(location.trim())}`;
              const geocodeResponse = await fetch(geocodeUrl, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
              });

              if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();
                if (geocodeData.ok && geocodeData.coords) {
                  console.log('✅ 서버 geocode API 성공:', geocodeData.coords);
                  createMapWithPosition(geocodeData.coords.lat, geocodeData.coords.lng);
                  return;
                }
              }
            } catch (geocodeError) {
              console.warn('서버 geocode API 실패, 클라이언트 검색 시도:', geocodeError);
            }

            // 서버 API 실패 시 클라이언트 측 검색 시도
            if (!window.kakao.maps.services) {
              console.error('카카오맵 서비스가 로드되지 않았습니다.');
              if (isMounted) {
                setMapError(true);
                setLoading(false);
              }
              return;
            }

            // 키워드 검색 시도 (한글 장소명에 유리)
            if (window.kakao.maps.services.Places) {
              const places = new window.kakao.maps.services.Places();
              places.keywordSearch(location.trim(), (data: any, status: any) => {
                if (!isMounted || !mapContainer.current) return;
                
                if (status === window.kakao.maps.services.Status.OK && data && data.length > 0) {
                  const lat = parseFloat(data[0].y);
                  const lng = parseFloat(data[0].x);
                  console.log('✅ 클라이언트 키워드 검색 성공:', { lat, lng });
                  createMapWithPosition(lat, lng);
                } else if (window.kakao.maps.services.Geocoder) {
                  // 키워드 검색 실패 시 주소 검색
                  const geocoder = new window.kakao.maps.services.Geocoder();
                  geocoder.addressSearch(location.trim(), (result: any, status: any) => {
                    if (!isMounted || !mapContainer.current) return;
                    if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
                      const lat = parseFloat(result[0].y);
                      const lng = parseFloat(result[0].x);
                      console.log('✅ 클라이언트 주소 검색 성공:', { lat, lng });
                      createMapWithPosition(lat, lng);
                    } else {
                      console.warn('⚠️ 모든 주소 검색 실패:', location);
                      // 검색 실패 시 기본 위치 사용
                      createMapWithPosition(37.5665, 126.9780);
                    }
                  });
                } else {
                  console.warn('주소 검색 서비스를 사용할 수 없습니다.');
                  createMapWithPosition(37.5665, 126.9780);
                }
              });
            } else if (window.kakao.maps.services.Geocoder) {
              // Places가 없으면 Geocoder만 사용
              const geocoder = new window.kakao.maps.services.Geocoder();
              geocoder.addressSearch(location.trim(), (result: any, status: any) => {
                if (!isMounted || !mapContainer.current) return;
                if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
                  const lat = parseFloat(result[0].y);
                  const lng = parseFloat(result[0].x);
                  console.log('✅ 클라이언트 주소 검색 성공:', { lat, lng });
                  createMapWithPosition(lat, lng);
                } else {
                  console.warn('⚠️ 주소 검색 실패:', location);
                  createMapWithPosition(37.5665, 126.9780);
                }
              });
            } else {
              console.warn('주소 검색 서비스를 사용할 수 없습니다.');
              createMapWithPosition(37.5665, 126.9780);
            }
          };

          const createMapWithPosition = (lat: number, lng: number) => {
            if (!isMounted || !mapContainer.current) return;
            
            try {
              const center = new window.kakao.maps.LatLng(lat, lng);
              const map = new window.kakao.maps.Map(mapContainer.current, {
                center: center,
                level: 3
              });
              mapInstanceRef.current = map;

              const marker = new window.kakao.maps.Marker({
                map: map,
                position: new window.kakao.maps.LatLng(lat, lng)
              });
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;"><strong>${itemType || '분실물'}</strong><br/>${description || location || ''}</div>`
              });
              infowindow.open(map, marker);
              map.setCenter(new window.kakao.maps.LatLng(lat, lng));

              if (isMounted) {
                setLoading(false);
                setMapError(false);
              }
            } catch (error) {
              console.error('지도 생성 오류:', error);
              if (isMounted) {
                setMapError(true);
                setLoading(false);
              }
            }
          };

          searchAddress();
        } else {
          // 좌표도 주소도 없으면 기본 위치 사용
          const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
          const map = new window.kakao.maps.Map(mapContainer.current, {
            center: center,
            level: 3
          });
          mapInstanceRef.current = map;

          if (isMounted) {
            setLoading(false);
            setMapError(false);
          }
        }
      } catch (error) {
        console.error('지도 초기화 오류:', error);
        if (isMounted) {
          setMapError(true);
          setLoading(false);
        }
      }
    };

    // 스크립트 로드 및 초기화
    const initKakaoMap = () => {
      if (!mapContainer.current) {
        return;
      }

      // 이미 로드되어 있으면 바로 사용
      if (typeof window.kakao !== 'undefined' && 
          window.kakao?.maps && 
          typeof window.kakao.maps.LatLng === 'function' &&
          typeof window.kakao.maps.Map === 'function') {
        setTimeout(() => loadMap(), 100);
        return;
      }

      // 이미 스크립트가 있으면 대기
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
      if (existingScript) {
        const checkInterval = setInterval(() => {
          if (!isMounted || !mapContainer.current) {
            clearInterval(checkInterval);
            return;
          }
          
          if (typeof window.kakao !== 'undefined' && 
              window.kakao?.maps && 
              typeof window.kakao.maps.LatLng === 'function' &&
              typeof window.kakao.maps.Map === 'function') {
            clearInterval(checkInterval);
            setTimeout(() => loadMap(), 100);
          }
        }, 200);
        intervals.push(checkInterval);
        
        // 최대 10초 대기
        setTimeout(() => {
          clearInterval(checkInterval);
          if (isMounted && !mapInstanceRef.current) {
            setMapError(true);
            setLoading(false);
          }
        }, 10000);
        return;
      }

      // 새로 스크립트 로드 (autoload=false로 변경하여 document.write() 에러 방지)
      const apiKey = process.env.REACT_APP_KAKAO_MAP_API_KEY || config.kakaoMapApiKey;
      if (!apiKey) {
        console.error('카카오맵 API 키가 설정되지 않았습니다. .env 파일에 REACT_APP_KAKAO_MAP_API_KEY를 설정해주세요.');
        if (isMounted) {
          setMapError(true);
          setLoading(false);
        }
        return;
      }
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
      script.async = true;
      script.id = 'kakao-map-script';
      
      script.onload = () => {
        // autoload=false이므로 maps.load() 호출 필요
        if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
          window.kakao.maps.load(() => {
            // maps.load() 콜백 후 충분히 기다린 다음 확인
            setTimeout(() => {
              const checkInterval = setInterval(() => {
                if (!isMounted || !mapContainer.current) {
                  clearInterval(checkInterval);
                  return;
                }
                
                if (typeof window.kakao !== 'undefined' && 
                    window.kakao?.maps && 
                    typeof window.kakao.maps.LatLng === 'function' &&
                    typeof window.kakao.maps.Map === 'function' &&
                    typeof window.kakao.maps.Marker === 'function') {
                  clearInterval(checkInterval);
                  loadMap();
                }
              }, 100);
              intervals.push(checkInterval);
              
              // 최대 5초 대기
              setTimeout(() => {
                clearInterval(checkInterval);
                if (isMounted && !mapInstanceRef.current) {
                  setMapError(true);
                  setLoading(false);
                }
              }, 5000);
            }, 500);
          });
        } else {
          // maps.load()가 없으면 직접 확인
          const checkInterval = setInterval(() => {
            if (!isMounted || !mapContainer.current) {
              clearInterval(checkInterval);
              return;
            }
            
            if (typeof window.kakao !== 'undefined' && 
                window.kakao?.maps && 
                typeof window.kakao.maps.LatLng === 'function' &&
                typeof window.kakao.maps.Map === 'function' &&
                typeof window.kakao.maps.Marker === 'function') {
              clearInterval(checkInterval);
              loadMap();
            }
          }, 200);
          intervals.push(checkInterval);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            if (isMounted && !mapInstanceRef.current) {
              setMapError(true);
              setLoading(false);
            }
          }, 10000);
        }
      };
      
      script.onerror = () => {
        if (isMounted) {
          setMapError(true);
          setLoading(false);
        }
      };
      
      document.head.appendChild(script);
    };

    // DOM 준비 후 초기화
    const timer = setTimeout(() => {
      if (mapContainer.current) {
        initKakaoMap();
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearAllIntervals();
    };
  }, [location, itemType, description, coords]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', margin: '16px 0' }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          border: '1px solid #ddd',
          backgroundColor: loading ? '#f5f5f5' : '#fff',
          minHeight: '400px'
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
          zIndex: 1
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
          color: '#d32f2f',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px 30px',
          borderRadius: '8px',
          zIndex: 10
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>⚠️ 지도 로드 실패</div>
          <div style={{ fontSize: '13px', marginBottom: '15px' }}>
            카카오맵을 불러올 수 없습니다.
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            페이지 새로고침
          </button>
        </div>
      )}
    </div>
  );
};

export default KakaoMapComponent;
