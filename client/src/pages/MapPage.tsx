import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LostItem, User } from '../types';

interface MapPageProps {
  lostItems: LostItem[];
  currentUser: User | null;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function MapPage({ lostItems, currentUser }: MapPageProps) {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const lostItemsCount = lostItems?.length || 0;

  useEffect(() => {
    // Kakao Map API 스크립트 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsMapLoaded(true);
      });
    };
    
    document.head.appendChild(script);

    return () => {
      // cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapContainer.current) return;

    try {
      // 지도 생성
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 기본 위치
        level: 5
      };

      const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options);
      setMap(kakaoMap);

      // 분실물 마커 표시
      lostItems.forEach((item) => {
        if (item.lat && item.lng) {
          const markerPosition = new window.kakao.maps.LatLng(item.lat, item.lng);
          
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            title: item.item_type
          });

          marker.setMap(kakaoMap);

          // 마커 클릭 시 상세 페이지로 이동
          window.kakao.maps.event.addListener(marker, 'click', () => {
            navigate(`/detail/${item.id}`);
          });

          // 인포윈도우 생성
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:10px;font-size:14px;min-width:150px;">
              <strong>${item.item_type}</strong><br/>
              <span style="color:#666;">${item.location}</span>
            </div>`
          });

          // 마커에 마우스오버 이벤트 등록
          window.kakao.maps.event.addListener(marker, 'mouseover', () => {
            infowindow.open(kakaoMap, marker);
          });

          // 마커에 마우스아웃 이벤트 등록
          window.kakao.maps.event.addListener(marker, 'mouseout', () => {
            infowindow.close();
          });
        }
      });

      // 첫 번째 분실물 위치로 지도 중심 이동
      if (lostItems.length > 0 && lostItems[0].lat && lostItems[0].lng) {
        const firstItemPosition = new window.kakao.maps.LatLng(
          lostItems[0].lat,
          lostItems[0].lng
        );
        kakaoMap.setCenter(firstItemPosition);
      }
    } catch (error) {
      console.error('지도 생성 오류:', error);
    }
  }, [isMapLoaded, lostItems, navigate]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
    }}>
      {/* 헤더 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 10000,
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: '700',
          margin: 0,
        }}>
          🗺️ 지도에서 찾기
        </h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/list')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
          >
            목록 보기
          </button>
          
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            메인으로
          </button>
        </div>
      </div>

      {/* 정보 패널 */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        background: 'white',
        padding: '15px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10000,
      }}>
        <div style={{
          fontSize: '14px',
          color: '#4a5568',
        }}>
          등록된 분실물: <strong style={{ color: '#667eea', fontSize: '16px' }}>{lostItemsCount}개</strong>
        </div>
        {lostItemsCount === 0 && (
          <div style={{
            fontSize: '12px',
            color: '#718096',
            marginTop: '5px',
          }}>
            아직 등록된 분실물이 없습니다
          </div>
        )}
      </div>

      {/* 지도 컨테이너 */}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
          paddingTop: '60px',
        }}
      />

      {/* 로딩 상태 */}
      {!isMapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          textAlign: 'center',
          zIndex: 10001,
        }}>
          <div style={{
            fontSize: '40px',
            marginBottom: '15px',
          }}>
            🗺️
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2d3748',
          }}>
            지도를 불러오는 중...
          </div>
        </div>
      )}
    </div>
  );
}
