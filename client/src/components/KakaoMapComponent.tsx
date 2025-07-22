import React, { useEffect, useState } from 'react';
import SimpleMapPlaceholder from './SimpleMapPlaceholder';

interface KakaoMapComponentProps {
  location: string;
  itemType: string;
  description: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

// 카카오맵 API 키 (환경변수에서 가져오거나 기본값 사용)
const KAKAO_MAP_API_KEY = process.env.REACT_APP_KAKAO_MAP_API_KEY || '247f5d27ed9dcae0f14e8f9c4d94144b';

const KakaoMapComponent: React.FC<KakaoMapComponentProps> = ({ location, itemType, description }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    console.log('KakaoMapComponent 마운트됨');
    console.log('API 키:', KAKAO_MAP_API_KEY);
    console.log('위치:', location);
    
    setDebugInfo(`API 키: ${KAKAO_MAP_API_KEY.substring(0, 8)}... | 위치: ${location}`);

    // 카카오맵이 로드될 때까지 대기
    const checkKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        console.log('카카오맵 로드 성공!');
        setMapLoaded(true);
        return;
      }
      
      // 아직 로드되지 않았다면 다시 시도
      setTimeout(checkKakaoMap, 100);
    };

    checkKakaoMap();

    // 10초 후에도 로드되지 않으면 에러
    const timeout = setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        console.error('카카오맵 로드 실패');
        setMapError('카카오맵을 로드할 수 없습니다. 도메인 설정을 확인해주세요.');
        setUseFallback(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !window.kakao) return;

    const container = document.getElementById('kakao-map');
    if (!container) {
      console.error('카카오맵 컨테이너를 찾을 수 없습니다');
      setMapError('지도 컨테이너 오류');
      setUseFallback(true);
      return;
    }

    try {
      console.log('지도 초기화 시작...');
      
      // 기본 위치 (서울 시청)
      const defaultPosition = new window.kakao.maps.LatLng(37.5665, 126.9780);
      
      const options = {
        center: defaultPosition,
        level: 2
      };

      const map = new window.kakao.maps.Map(container, options);
      console.log('지도 생성 완료');

      // 주소로 좌표 검색
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      // 여러 가지 주소 형식으로 시도
      const addressVariations = [
        location,
        `${location} 서울`,
        `${location} 서울특별시`,
        location.replace('고려대학교', '고려대'),
        location.replace('정경대', '정경관'),
        '고려대학교',
        '고려대'
      ];
      
      // 주요 대학의 정확한 좌표 (주소 검색 실패 시 사용)
      const universityCoordinates: { [key: string]: { lat: number, lng: number, name: string } } = {
        '고려대학교': { lat: 37.5906, lng: 127.0324, name: '고려대학교' },
        '고려대': { lat: 37.5906, lng: 127.0324, name: '고려대학교' },
        '서울대학교': { lat: 37.4592, lng: 126.9519, name: '서울대학교' },
        '연세대학교': { lat: 37.5642, lng: 126.9345, name: '연세대학교' },
        '성균관대학교': { lat: 37.5889, lng: 126.9915, name: '성균관대학교' },
        '중앙대학교': { lat: 37.5067, lng: 126.9587, name: '중앙대학교' },
        '경희대학교': { lat: 37.5964, lng: 127.0527, name: '경희대학교' }
      };
      
      // 고려대학교 내 주요 건물 좌표
      const koreaUniversityBuildings: { [key: string]: { lat: number, lng: number, name: string } } = {
        '사범대학': { lat: 37.5898, lng: 127.0328, name: '사범대학본관' },
        '사범대학본관': { lat: 37.5898, lng: 127.0328, name: '사범대학본관' },
        '정경대': { lat: 37.5902, lng: 127.0320, name: '정경관' },
        '정경관': { lat: 37.5902, lng: 127.0320, name: '정경관' },
        '법학관': { lat: 37.5905, lng: 127.0330, name: '법학관신관' },
        '법학관신관': { lat: 37.5905, lng: 127.0330, name: '법학관신관' },
        '중앙도서관': { lat: 37.5900, lng: 127.0315, name: '중앙도서관' },
        '경영본관': { lat: 37.5895, lng: 127.0310, name: '경영본관' },
        '인촌기념관': { lat: 37.5908, lng: 127.0325, name: '인촌기념관' },
        '박물관': { lat: 37.5903, lng: 127.0322, name: '박물관' },
        '학생회관': { lat: 37.5897, lng: 127.0318, name: '학생회관' },
        '안암학사': { lat: 37.5910, lng: 127.0335, name: '안암학사' },
        '고시동': { lat: 37.5912, lng: 127.0338, name: '안암학사 고시동' },
        '여학생동': { lat: 37.5908, lng: 127.0332, name: '안암학사 여학생동' },
        '글로벌하우스': { lat: 37.5915, lng: 127.0340, name: '안암학사 글로벌하우스' },
        '정문': { lat: 37.5895, lng: 127.0315, name: '고려대학교 정문' },
        '고려대학교 정문': { lat: 37.5895, lng: 127.0315, name: '고려대학교 정문' },
        '후문': { lat: 37.5920, lng: 127.0345, name: '고려대학교 후문' },
        '고려대학교 후문': { lat: 37.5920, lng: 127.0345, name: '고려대학교 후문' },
        '측문': { lat: 37.5885, lng: 127.0330, name: '고려대학교 측문' },
        '고려대학교 측문': { lat: 37.5885, lng: 127.0330, name: '고려대학교 측문' },
        '서문': { lat: 37.5905, lng: 127.0290, name: '고려대학교 서문' },
        '고려대학교 서문': { lat: 37.5905, lng: 127.0290, name: '고려대학교 서문' }
      };
      
      console.log('시도할 주소 목록:', addressVariations);
      
      let searchCompleted = false;
      let currentMarker: any = null;
      
      const tryAddressSearch = (addressIndex: number) => {
        if (searchCompleted || addressIndex >= addressVariations.length) {
          // 모든 주소 시도 실패 시 대학 좌표 확인
          let fallbackPosition = defaultPosition;
          let fallbackName = '서울시청';
          
          // 고려대학교 내 건물 좌표에서 먼저 찾기
          for (const [key, coords] of Object.entries(koreaUniversityBuildings)) {
            if (location.includes(key) || key.includes(location.replace('고려대학교 ', ''))) {
              fallbackPosition = new window.kakao.maps.LatLng(coords.lat, coords.lng);
              fallbackName = coords.name;
              console.log(`고려대학교 건물 좌표 사용: ${fallbackName} (${coords.lat}, ${coords.lng})`);
              break;
            }
          }
          
          // 고려대학교 건물에서 못 찾으면 일반 대학 좌표에서 찾기
          if (fallbackName === '서울시청') {
            for (const [key, coords] of Object.entries(universityCoordinates)) {
              if (location.includes(key) || key.includes(location.replace('고려대학교', '고려대'))) {
                fallbackPosition = new window.kakao.maps.LatLng(coords.lat, coords.lng);
                fallbackName = coords.name;
                console.log(`대학 좌표 사용: ${fallbackName} (${coords.lat}, ${coords.lng})`);
                break;
              }
            }
          }
          
          // 기존 마커가 있으면 제거
          if (currentMarker) {
            currentMarker.setMap(null);
          }
          
          // 새로운 마커 생성 및 지도에 추가
          currentMarker = new window.kakao.maps.Marker({
            position: fallbackPosition,
            map: map
          });

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 150px; max-width: 180px; font-size: 12px;">
                <div style="font-weight: bold; color: #333; margin-bottom: 3px;">${itemType}</div>
                <div style="color: #666; margin-bottom: 3px; font-size: 11px;">${description}</div>
                <div style="color: #999; margin-bottom: 2px; font-size: 10px;">위치: ${location}</div>
                <div style="color: #f00; font-size: 9px; margin-bottom: 2px;">(정확한 위치를 찾을 수 없어 ${fallbackName}에 표시됩니다)</div>
                <div style="color: #ccc; font-size: 8px;">시도한 주소: ${addressVariations.join(', ')}</div>
              </div>
            `
          });

          window.kakao.maps.event.addListener(currentMarker, 'click', () => {
            infowindow.open(map, currentMarker);
          });
          
          // 지도 중심을 마커 위치로 이동하고 줌 레벨 조정
          map.setCenter(fallbackPosition);
          map.setLevel(2);
          console.log(`모든 주소 시도 실패, ${fallbackName}에 마커 표시`);
          return;
        }
        
        const currentAddress = addressVariations[addressIndex];
        console.log(`주소 검색 시도 ${addressIndex + 1}: "${currentAddress}"`);
        
        geocoder.addressSearch(currentAddress, (result: any[], status: string) => {
          console.log(`주소 검색 결과 (${currentAddress}):`, status, result);
          
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            searchCompleted = true;
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

            // 기존 마커가 있으면 제거
            if (currentMarker) {
              currentMarker.setMap(null);
            }

            // 새로운 마커 생성 및 지도에 추가
            currentMarker = new window.kakao.maps.Marker({
              position: coords,
              map: map
            });

            // 인포윈도우 생성
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
                <div style="padding: 8px; min-width: 150px; max-width: 180px; font-size: 12px;">
                  <div style="font-weight: bold; color: #333; margin-bottom: 3px;">${itemType}</div>
                  <div style="color: #666; margin-bottom: 3px; font-size: 11px;">${description}</div>
                  <div style="color: #999; margin-bottom: 2px; font-size: 10px;">${location}</div>
                  <div style="color: #666; font-size: 9px;">찾은 주소: ${result[0].address_name}</div>
              </div>
            `
          });

            // 마커 클릭 시 인포윈도우 표시
            window.kakao.maps.event.addListener(currentMarker, 'click', () => {
              infowindow.open(map, currentMarker);
            });

            // 지도 중심을 마커 위치로 이동하고 줌 레벨 조정
            map.setCenter(coords);
            map.setLevel(2);
            console.log(`성공! 마커 위치로 지도 이동 완료: ${result[0].address_name}`);
          } else {
            // 다음 주소 시도
            setTimeout(() => tryAddressSearch(addressIndex + 1), 500);
          }
        });
      };
      
      // 첫 번째 주소로 검색 시작
      tryAddressSearch(0);
    } catch (error) {
      console.error('지도 초기화 오류:', error);
      setMapError('지도를 초기화할 수 없습니다.');
      setUseFallback(true);
    }
  }, [mapLoaded, location, itemType, description]);

  // 카카오맵이 로드되지 않으면 SimpleMapPlaceholder 사용
  if (useFallback) {
    return <SimpleMapPlaceholder location={location} itemType={itemType} description={description} />;
  }

  if (mapError) {
    return (
      <div className="map-error">
        <p>지도를 불러올 수 없습니다: {mapError}</p>
        <p><strong>디버그 정보:</strong> {debugInfo}</p>
        <p>카카오맵 API 설정 방법:</p>
        <ol>
          <li><a href="https://developers.kakao.com/" target="_blank" rel="noopener noreferrer">카카오 개발자 사이트</a>에서 애플리케이션 생성</li>
          <li>플랫폼 &gt; Web 플랫폼 등록</li>
          <li>도메인 설정에 다음 추가:
            <ul>
              <li><code>http://localhost:3000</code></li>
              <li><code>https://localhost:3000</code> (HTTPS 사용 시)</li>
              <li><code>http://127.0.0.1:3000</code></li>
        </ul>
          </li>
          <li>JavaScript 키를 복사하여 환경변수 <code>REACT_APP_KAKAO_MAP_API_KEY</code>에 설정</li>
        </ol>
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

  if (!mapLoaded) {
    return (
      <div className="map-loading">
        <p>지도를 불러오는 중...</p>
        <p><small>{debugInfo}</small></p>
      </div>
    );
  }

  return (
    <div className="kakao-map-container">
      <div id="kakao-map" style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
};

export default KakaoMapComponent; 