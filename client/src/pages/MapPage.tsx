import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LostItem as AppLostItem } from '../App';
import type { User as AppUser } from '../App';
import GoogleMapComponent, { MarkerData } from '../components/GoogleMapComponent';
import NaverMapComponent from '../components/NaverMapComponent';

interface MapPageProps {
  lostItems: AppLostItem[];
  currentUser: AppUser | null;
  theme?: 'light' | 'dark';
}

type MapType = 'google' | 'naver';

export default function MapPage({ lostItems, currentUser, theme = 'light' }: MapPageProps) {
  const navigate = useNavigate();
  const [mapType, setMapType] = useState<MapType>('naver'); // 기본값: 네이버 지도
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | string | null>(null);

  // 분실물 데이터를 마커 데이터로 변환
  const markers: MarkerData[] = useMemo(() => {
    return lostItems
      .filter(item => item.lat && item.lng)
      .map(item => ({
        id: item.id,
        position: {
          lat: item.lat!,
          lng: item.lng!,
        },
        title: item.title || '분실물',
        description: item.description || item.locationText || '',
        isMyItem: currentUser ? String(item.ownerId) === String(currentUser.id) : false,
      }));
  }, [lostItems, currentUser]);

  // 지도 중심점 계산 (마커들의 평균 위치 또는 서울 시청)
  const mapCenter = useMemo(() => {
    if (markers.length === 0) {
      return { lat: 37.5665, lng: 126.9780 }; // 서울 시청
    }
    
    const avgLat = markers.reduce((sum, m) => sum + m.position.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, m) => sum + m.position.lng, 0) / markers.length;
    return { lat: avgLat, lng: avgLng };
  }, [markers]);

  const handleMarkerClick = (markerId: number | string) => {
    setSelectedMarkerId(markerId);
    navigate(`/detail/${markerId}`);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      background: '#f5f5f5',
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        gap: '12px',
      }}>
        {/* 왼쪽: 네이버 지도 텍스트가 있는 흰 박스 */}
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#667eea',
          }}>
            네이버 지도
          </span>
        </div>
        
        {/* 오른쪽: 구글 지도 버튼 */}
        <button
          onClick={() => setMapType('google')}
          style={{
            padding: '12px 24px',
            background: mapType === 'google' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
            color: mapType === 'google' ? '#667eea' : 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            boxShadow: mapType === 'google' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          구글 지도
        </button>
      </div>

      {/* 지도 영역 */}
      <div style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        height: '100%',
      }}>
        {mapType === 'google' ? (
          <GoogleMapComponent
            center={mapCenter}
            zoom={markers.length > 0 ? 13 : 15}
            markers={markers}
            onMarkerClick={handleMarkerClick}
            selectedMarkerId={selectedMarkerId}
            height="100%"
          />
        ) : (
          <NaverMapComponent
            center={mapCenter}
            zoom={markers.length > 0 ? 13 : 15}
            markers={markers}
            onMarkerClick={handleMarkerClick}
            selectedMarkerId={selectedMarkerId}
            height="100%"
          />
        )}
      </div>

    </div>
  );
}
