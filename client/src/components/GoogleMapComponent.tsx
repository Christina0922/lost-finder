import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface MarkerData {
  id: number | string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
  isHighlighted?: boolean;
  isMyItem?: boolean;
}

interface GoogleMapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerData[];
  onMarkerClick?: (markerId: number | string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedMarkerId?: number | string | null;
  showSearchMarker?: boolean;
  searchMarkerPosition?: { lat: number; lng: number } | null;
  height?: string;
  className?: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  center = { lat: 37.5665, lng: 126.9780 }, // 서울 시청
  zoom = 15,
  markers = [],
  onMarkerClick,
  onMapClick,
  selectedMarkerId,
  showSearchMarker = false,
  searchMarkerPosition,
  height = '500px',
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const markersRef = useRef<Map<number | string, google.maps.Marker>>(new Map());
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);

  // Google Maps API 로드
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('지도 API 키가 설정되지 않았습니다. ENV_SETUP.md를 참고하여 API 키를 설정해주세요.');
      console.error('❌ REACT_APP_GOOGLE_MAPS_API_KEY 환경변수가 없습니다.');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
      language: 'ko',
      region: 'KR',
    });

    loader
      .load()
      .then(() => {
        console.log('✅ 지도 API 로드 완료');
        setMapLoaded(true);
      })
      .catch((err) => {
        console.error('❌ 지도 API 로드 실패:', err);
        setError('지도를 불러올 수 없습니다. 인터넷 연결을 확인해주세요.');
      });
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || map) return;

    try {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'greedy',
      });

      // 지도 클릭 이벤트
      if (onMapClick) {
        newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });
      }

      setMap(newMap);
      console.log('✅ 지도 초기화 완료');
    } catch (err) {
      console.error('❌ 지도 초기화 실패:', err);
      setError('지도를 초기화할 수 없습니다.');
    }
  }, [mapLoaded, map, center, zoom, onMapClick]);

  // 중심 이동
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center]);

  // 줌 변경
  useEffect(() => {
    if (map && zoom) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  // 검색 마커 표시 (임시 마커)
  useEffect(() => {
    if (!map) return;

    // 기존 검색 마커 제거
    if (searchMarkerRef.current) {
      searchMarkerRef.current.setMap(null);
      searchMarkerRef.current = null;
    }

    // 새 검색 마커 추가
    if (showSearchMarker && searchMarkerPosition) {
      const marker = new google.maps.Marker({
        position: searchMarkerPosition,
        map,
        title: '선택한 위치',
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      searchMarkerRef.current = marker;
    }
  }, [map, showSearchMarker, searchMarkerPosition]);

  // 마커 렌더링
  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    // 새 마커 추가
    markers.forEach((markerData) => {
      const isSelected = selectedMarkerId === markerData.id;
      const isMyItem = markerData.isMyItem || false;

      // 마커 아이콘 설정
      let iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      let scale = 35;

      if (isSelected) {
        iconUrl = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        scale = 50; // 선택된 마커는 크게
      } else if (isMyItem) {
        iconUrl = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      }

      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(scale, scale),
        },
      });

      // 마커 클릭 이벤트
      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(markerData.id);
        }
      });

      // InfoWindow (설명)
      if (markerData.description) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${markerData.title}</h4>
              <p style="margin: 0; font-size: 12px; color: #666;">${markerData.description}</p>
              ${isMyItem ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #4CAF50; font-weight: bold;">✓ 내가 등록</p>' : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }

      markersRef.current.set(markerData.id, marker);
    });
  }, [map, markers, selectedMarkerId, onMarkerClick]);

  // 선택된 마커로 자동 이동
  useEffect(() => {
    if (map && selectedMarkerId) {
      const marker = markersRef.current.get(selectedMarkerId);
      if (marker) {
        const position = marker.getPosition();
        if (position) {
          map.panTo(position);
          map.setZoom(17); // 더 가까이
        }
      }
    }
  }, [map, selectedMarkerId]);

  // 오류 표시
  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: '#fff3cd',
          border: '2px solid #ffeaa7',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px',
          color: '#856404',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '15px' }}>⚠️</div>
        <div style={{ fontSize: '16px', textAlign: 'center', fontWeight: 'bold', marginBottom: '8px' }}>
          지도를 불러올 수 없습니다
        </div>
        <div style={{ fontSize: '14px', textAlign: 'center', color: '#666' }}>
          {error}
        </div>
      </div>
    );
  }

  // 로딩 중
  if (!mapLoaded) {
    return (
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: '#f8f9fa',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '15px' }}>🗺️</div>
        <div style={{ fontSize: '16px', color: '#6c757d' }}>지도 로딩 중...</div>
      </div>
    );
  }

  // 실제 지도
  return (
    <div
      ref={mapRef}
      className={className}
      style={{
        width: '100%',
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    />
  );
};

export default GoogleMapComponent;

