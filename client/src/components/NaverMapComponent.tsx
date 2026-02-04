import React, { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    naver?: any;
  }
}

export type LatLng = { lat: number; lng: number };

/**
 * ✅ GoogleMapComponent의 MarkerData 형태가 (position:{lat,lng}) 일 수 있으므로
 * ✅ Naver 쪽은 둘 다 받도록 유연하게 정의합니다.
 */
export type MarkerData = {
  id: string | number;
  title?: string;

  // 케이스 1) 직접 lat/lng
  lat?: number;
  lng?: number;

  // 케이스 2) position으로 들어오는 경우
  position?: { lat: number; lng: number };
};

export interface NaverMapComponentProps {
  center: LatLng;
  zoom?: number;
  markers?: MarkerData[];
  onMarkerClick?: (markerId: string | number) => void;
  selectedMarkerId?: string | number | null;
  height?: string; // 예: "100%", "500px", "calc(100vh - 72px)"
}

const NAVER_SCRIPT_ID = "naver-maps-sdk";

const NaverMapComponent: React.FC<NaverMapComponentProps> = ({
  center,
  zoom = 14,
  markers = [],
  onMarkerClick,
  selectedMarkerId = null,
  height = "calc(100vh - 72px)",
}) => {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  /**
   * ✅ TS2802( MapIterator 에러 )를 피하기 위해 Map을 쓰지 않습니다.
   * id -> markerInstance를 일반 객체로 관리합니다.
   */
  const markerStoreRef = useRef<Record<string, any>>({});

  const [error, setError] = useState<string | null>(null);

  const ncpClientId = useMemo(() => process.env.REACT_APP_NAVER_MAPS_API_KEY, []);

  // MarkerData를 (lat,lng)로 정규화
  const normalizeMarker = (m: MarkerData): { id: string | number; lat: number; lng: number; title?: string } | null => {
    if (typeof m?.id === "undefined" || m?.id === null) return null;

    if (typeof m.lat === "number" && typeof m.lng === "number") {
      return { id: m.id, lat: m.lat, lng: m.lng, title: m.title };
    }
    if (m.position && typeof m.position.lat === "number" && typeof m.position.lng === "number") {
      return { id: m.id, lat: m.position.lat, lng: m.position.lng, title: m.title };
    }
    return null;
  };

  // 1) SDK 로드 + 지도 최초 생성
  useEffect(() => {
    if (!ncpClientId) {
      setError("네이버 지도 API 키가 설정되지 않았습니다. (.env의 REACT_APP_NAVER_MAPS_API_KEY 확인)");
      return;
    }

    const initMap = () => {
      try {
        if (!window.naver || !window.naver.maps) {
          setError("네이버 지도 SDK 로드에 실패했습니다(네이버 maps.js 로드 실패).");
          return;
        }
        if (!mapDivRef.current) return;
        if (mapRef.current) return; // 중복 생성 방지

        const centerLatLng = new window.naver.maps.LatLng(center.lat, center.lng);

        const map = new window.naver.maps.Map(mapDivRef.current, {
          center: centerLatLng,
          zoom,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        });

        mapRef.current = map;
        setError(null);
      } catch (e: any) {
        setError(`네이버 지도 초기화 오류: ${e?.message ?? String(e)}`);
      }
    };

    const existing = document.getElementById(NAVER_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.naver && window.naver.maps) initMap();
      else existing.addEventListener("load", initMap, { once: true });
      return;
    }

    // ✅ 핵심: ncpClientId 파라미터로 로딩해야 인증 실패 타일이 안 뜹니다.
    const script = document.createElement("script");
    script.id = NAVER_SCRIPT_ID;
    script.type = "text/javascript";
    script.async = true;
    script.defer = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${encodeURIComponent(ncpClientId)}`;

    script.onload = initMap;
    script.onerror = () => setError("네이버 지도 SDK 로드 실패(도메인 등록/Web 서비스 URL 확인).");

    document.head.appendChild(script);
  }, [center.lat, center.lng, zoom, ncpClientId]);

  // 2) center/zoom 변경 반영
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.naver?.maps) return;

    const newCenter = new window.naver.maps.LatLng(center.lat, center.lng);
    map.setCenter(newCenter);
    map.setZoom(zoom);
  }, [center.lat, center.lng, zoom]);

  // 3) 마커 렌더링/업데이트
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.naver?.maps) return;

    // 유효한 마커만 정규화해서 사용
    const normalized = markers.map(normalizeMarker).filter(Boolean) as Array<{
      id: string | number;
      lat: number;
      lng: number;
      title?: string;
    }>;

    const currentIds = new Set(normalized.map((m) => String(m.id)));

    // ✅ 기존 마커 중 이번 markers에 없는 것은 제거
    const store = markerStoreRef.current;
    for (const idStr of Object.keys(store)) {
      if (!currentIds.has(idStr)) {
        try {
          store[idStr].setMap(null);
        } catch {
          // ignore
        }
        delete store[idStr];
      }
    }

    // ✅ 필요한 마커 생성/갱신
    for (const m of normalized) {
      const idStr = String(m.id);
      const pos = new window.naver.maps.LatLng(m.lat, m.lng);

      const existing = store[idStr];
      if (existing) {
        existing.setPosition(pos);
        continue;
      }

      const marker = new window.naver.maps.Marker({
        position: pos,
        map,
        title: m.title ?? "",
      });

      if (onMarkerClick) {
        window.naver.maps.Event.addListener(marker, "click", () => onMarkerClick(m.id));
      }

      store[idStr] = marker;
    }
  }, [markers, onMarkerClick]);

  // 4) 선택된 마커 강조(간단히 zIndex로)
  useEffect(() => {
    if (!window.naver?.maps) return;

    const store = markerStoreRef.current;
    const selectedStr = selectedMarkerId == null ? null : String(selectedMarkerId);

    for (const idStr of Object.keys(store)) {
      const mk = store[idStr];
      if (!mk) continue;

      if (selectedStr !== null && idStr === selectedStr) mk.setZIndex(999);
      else mk.setZIndex(1);
    }
  }, [selectedMarkerId]);

  return (
    <div style={{ width: "100%", height }}>
      {error ? (
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>지도를 불러올 수 없습니다</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
            네이버 클라우드 Maps Application의 Web 서비스 URL에 http://localhost:3000 을 추가했는지 확인해 주세요.
          </div>
        </div>
      ) : null}

      <div
        ref={mapDivRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: height,
        }}
      />
    </div>
  );
};

export default NaverMapComponent;
