// D:\1000_b_project\lostfinder\client\src\components\GoogleMapComponent.tsx

import { useEffect, useMemo, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export type MarkerData = {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
};

type Props = {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MarkerData[];
  onMarkerClick?: (markerId: string | number) => void;
  selectedMarkerId?: string | number | null;
  height?: string; // 예: "420px"
};

export default function GoogleMapComponent({
  center,
  zoom,
  markers,
  onMarkerClick,
  selectedMarkerId,
  height = '420px'
}: Props) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerObjsRef = useRef<Map<string | number, google.maps.Marker>>(new Map());

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const loader = useMemo(() => {
    return new Loader({
      apiKey: apiKey || '',
      version: 'weekly',
      libraries: ['places']
    });
  }, [apiKey]);

  // 1) 지도 로드
  useEffect(() => {
    if (!apiKey) {
      console.error('REACT_APP_GOOGLE_MAPS_API_KEY is missing in .env');
      return;
    }

    let cancelled = false;

    const init = async () => {
      await loader.load(); // google.maps 를 전역에 올려줍니다

      if (cancelled) return;
      if (!divRef.current) return;

      mapRef.current = new google.maps.Map(divRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [apiKey, loader]);

  // 2) center/zoom 반영
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setCenter(center);
    map.setZoom(zoom);
  }, [center, zoom]);

  // 3) 마커 반영
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markerMap = markerObjsRef.current;

    // 기존에 있는데 이번 markers에 없는 것은 제거
    const nextIds = new Set(markers.map(m => m.id));
    for (const [id, mk] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        mk.setMap(null);
        markerMap.delete(id);
      }
    }

    // 추가/업데이트
    markers.forEach(m => {
      const existing = markerMap.get(m.id);
      if (existing) {
        existing.setPosition({ lat: m.lat, lng: m.lng });
        if (m.title) existing.setTitle(m.title);
        return;
      }

      const newMarker = new google.maps.Marker({
        map,
        position: { lat: m.lat, lng: m.lng },
        title: m.title || ''
      });

      newMarker.addListener('click', () => {
        onMarkerClick?.(m.id);
      });

      markerMap.set(m.id, newMarker);
    });
  }, [markers, onMarkerClick]);

  // 4) 선택 마커 강조(간단: zIndex 올리기)
  useEffect(() => {
    const markerMap = markerObjsRef.current;

    for (const [id, mk] of markerMap.entries()) {
      if (selectedMarkerId != null && id === selectedMarkerId) {
        mk.setZIndex(9999);
      } else {
        mk.setZIndex(undefined);
      }
    }
  }, [selectedMarkerId]);

  return (
    <div
      ref={divRef}
      style={{
        width: '100%',
        height,
        minHeight: '300px',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    />
  );
}
