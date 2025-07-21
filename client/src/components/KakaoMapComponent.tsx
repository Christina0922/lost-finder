import React, { useEffect, useState } from 'react';

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

const KakaoMapComponent: React.FC<KakaoMapComponentProps> = ({ location, itemType, description }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
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

    // 5초 후에도 로드되지 않으면 에러
    const timeout = setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        console.error('카카오맵 로드 실패');
        setMapError('카카오맵을 로드할 수 없습니다. 도메인 설정을 확인해주세요.');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !window.kakao) return;

    const container = document.getElementById('kakao-map');
    if (!container) return;

    try {
      console.log('지도 초기화 시작...');
      
      // 기본 위치 (서울 시청)
      const defaultPosition = new window.kakao.maps.LatLng(37.5665, 126.9780);
      
      const options = {
        center: defaultPosition,
        level: 3
      };

      const map = new window.kakao.maps.Map(container, options);
      console.log('지도 생성 완료');

      // 주소로 좌표 검색
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(location, (result: any[], status: string) => {
        console.log('주소 검색 결과:', status, result);
        
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: coords
          });

          // 인포윈도우 생성
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 5px 0; color: #333;">${itemType}</h3>
                <p style="margin: 5px 0; color: #666;">${description}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #999;">${location}</p>
              </div>
            `
          });

          // 마커 클릭 시 인포윈도우 표시
          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(map, marker);
          });

          // 지도 중심을 마커 위치로 이동
          map.setCenter(coords);
          console.log('마커 위치로 지도 이동 완료');
        } else {
          // 주소 검색 실패 시 기본 위치에 마커 표시
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: defaultPosition
          });

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 5px 0; color: #333;">${itemType}</h3>
                <p style="margin: 5px 0; color: #666;">${description}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #999;">위치: ${location}</p>
                <p style="margin: 5px 0; font-size: 11px; color: #f00;">(정확한 위치를 찾을 수 없어 기본 위치에 표시됩니다)</p>
              </div>
            `
          });

          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(map, marker);
          });
          console.log('기본 위치에 마커 표시');
        }
      });
    } catch (error) {
      console.error('지도 초기화 오류:', error);
      setMapError('지도를 초기화할 수 없습니다.');
    }
  }, [mapLoaded, location, itemType, description]);

  if (mapError) {
    return (
      <div className="map-error">
        <p>지도를 불러올 수 없습니다: {mapError}</p>
        <p>카카오 개발자 콘솔에서 다음을 확인해주세요:</p>
        <ul>
          <li>JavaScript 키가 올바른지 확인</li>
          <li>도메인 설정에 localhost:3000 추가</li>
          <li>플랫폼 &gt; Web 플랫폼 등록</li>
        </ul>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="map-loading">
        <p>지도를 불러오는 중...</p>
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