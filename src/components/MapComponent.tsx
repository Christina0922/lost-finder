import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    description?: string;
  }>;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  selectable?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 37.5665, lng: 126.9780 }, // 서울 시청
  zoom = 13,
  markers = [],
  onLocationSelect,
  selectable = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [googleMarkers, setGoogleMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const newMap = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        setMap(newMap);

        // 클릭 이벤트 추가 (위치 선택 모드일 때)
        if (selectable && onLocationSelect) {
          newMap.addListener('click', async (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              
              // 주소 정보 가져오기
              const geocoder = new google.maps.Geocoder();
              try {
                const response = await geocoder.geocode({ location: { lat, lng } });
                const address = response.results[0]?.formatted_address || '';
                
                onLocationSelect({ lat, lng, address });
              } catch (error) {
                console.error('Geocoding error:', error);
                onLocationSelect({ lat, lng, address: '' });
              }
            }
          });
        }
      }
    }).catch((error) => {
      console.error('Google Maps 로딩 실패:', error);
    });
  }, [center, zoom, selectable, onLocationSelect]);

  // 마커 업데이트
  useEffect(() => {
    if (!map) return;

    // 기존 마커들 제거
    googleMarkers.forEach(marker => marker.setMap(null));

    // 새 마커들 추가
    const newMarkers = markers.map(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        animation: google.maps.Animation.DROP
      });

      // 정보창 추가
      if (markerData.description) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3>${markerData.title}</h3>
              <p>${markerData.description}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }

      return marker;
    });

    setGoogleMarkers(newMarkers);
  }, [map, markers]);

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%' }}
      />
      {selectable && (
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          background: 'white', 
          padding: '5px 10px', 
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '12px'
        }}>
          지도를 클릭하여 위치를 선택하세요
        </div>
      )}
    </div>
  );
};

export default MapComponent; 