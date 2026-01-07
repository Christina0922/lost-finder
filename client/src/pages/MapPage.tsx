import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GoogleMapComponent, { MarkerData } from '../components/GoogleMapComponent';
import { searchPlaces, getPlaceDetails, PlacePrediction, PlaceDetails } from '../utils/api';
import { getDeviceId, isMyItem } from '../utils/deviceId';
import type { LostItem, User } from '../types';
import './MapPage.css';

// 분실물 지도 페이지

interface MapPageProps {
  lostItems: LostItem[];
  currentUser: User | null;
}

const MapPage: React.FC<MapPageProps> = ({ lostItems, currentUser }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL에서 전달된 itemId 확인 (상세 페이지에서 "지도에서 보기" 클릭 시)
  const highlightedItemId = location.state?.itemId;

  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(
    highlightedItemId ? parseInt(highlightedItemId) : null
  );
  const [showBottomPanel, setShowBottomPanel] = useState(!!highlightedItemId);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const deviceId = getDeviceId();

  // URL에서 전달된 itemId가 있으면 해당 마커로 이동
  useEffect(() => {
    if (highlightedItemId) {
      const item = lostItems.find((i) => i.id === parseInt(highlightedItemId));
      if (item && item.lat && item.lng) {
        setMapCenter({ lat: item.lat, lng: item.lng });
        setMapZoom(17);
        setSelectedItemId(item.id);
        setShowBottomPanel(true);
      }
    }
  }, [highlightedItemId, lostItems]);

  // 장소 검색 (디바운스)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchInput.trim().length < 2) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchInput);
        setPredictions(results);
      } catch (error) {
        console.error('장소 검색 실패:', error);
        setPredictions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  // 장소 선택
  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    try {
      setIsSearching(true);
      const details = await getPlaceDetails(prediction.placeId);
      setSelectedPlace(details);
      setMapCenter({ lat: details.lat, lng: details.lng });
      setMapZoom(17);
      setPredictions([]);
      setSearchInput(prediction.description);
      setShowBottomPanel(false); // 검색 위치 선택 시 하단 패널 닫기
      setSelectedItemId(null);
    } catch (error) {
      console.error('장소 정보 조회 실패:', error);
      alert(t('mapPage.placeDetailsFailed') || '장소 정보를 불러올 수 없습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 마커로 변환 (좌표가 있는 분실물만)
  const markers: MarkerData[] = lostItems
    .filter((item) => item.lat && item.lng)
    .map((item) => ({
      id: item.id,
      position: { lat: item.lat!, lng: item.lng! },
      title: item.item_type,
      description: item.description,
      isHighlighted: item.id === selectedItemId,
      isMyItem: isMyItem(item.created_by_device_id),
    }));

  // 마커 클릭
  const handleMarkerClick = useCallback((markerId: number | string) => {
    setSelectedItemId(markerId as number);
    setShowBottomPanel(true);
    setSelectedPlace(null); // 검색 위치 초기화
  }, []);

  // 선택된 아이템
  const selectedItem = selectedItemId
    ? lostItems.find((item) => item.id === selectedItemId)
    : null;

  // 등록하기 버튼
  const handleRegisterClick = () => {
    if (!selectedPlace) {
      alert(t('mapPage.selectLocationFirst') || '먼저 장소를 검색하여 선택해주세요.');
      return;
    }

    navigate('/edit/new', {
      state: {
        location: selectedPlace.placeName,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        place_name: selectedPlace.placeName,
        address: selectedPlace.address,
      },
    });
  };

  // 상세보기 버튼
  const handleViewDetail = () => {
    if (selectedItemId) {
      navigate(`/detail/${selectedItemId}`);
    }
  };

  return (
    <div className="map-page">
      {/* 상단 검색 바 */}
      <div className="map-search-container">
        <input
          type="text"
          className="map-search-input"
          placeholder={t('mapPage.searchPlaceholder') || '장소를 검색하세요 (예: 남사중학교)'}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {isSearching && <div className="map-search-loading">검색 중...</div>}
        
        {predictions.length > 0 && (
          <div className="map-search-results">
            {predictions.map((prediction) => (
              <div
                key={prediction.placeId}
                className="map-search-result-item"
                onClick={() => handlePlaceSelect(prediction)}
              >
                <div className="map-search-result-main">{prediction.mainText}</div>
                <div className="map-search-result-secondary">{prediction.secondaryText}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 지도 */}
      <div className="map-container-full">
        <GoogleMapComponent
          center={mapCenter}
          zoom={mapZoom}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          selectedMarkerId={selectedItemId}
          showSearchMarker={!!selectedPlace}
          searchMarkerPosition={selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : null}
          height="calc(100vh - 60px - 80px)" // 헤더 - 하단 버튼 높이
        />
      </div>

      {/* 하단 패널 (분실물 선택 시) */}
      {showBottomPanel && selectedItem && (
        <div className="map-bottom-panel">
          <button
            className="map-bottom-panel-close"
            onClick={() => {
              setShowBottomPanel(false);
              setSelectedItemId(null);
            }}
          >
            ✕
          </button>
          <h3 className="map-bottom-panel-title">{selectedItem.item_type}</h3>
          <p className="map-bottom-panel-description">{selectedItem.description}</p>
          <div className="map-bottom-panel-info">
            <div><strong>위치:</strong> {selectedItem.place_name || selectedItem.location}</div>
            <div><strong>주소:</strong> {selectedItem.address || '주소 정보 없음'}</div>
            <div><strong>등록일:</strong> {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString() : '-'}</div>
            {isMyItem(selectedItem.created_by_device_id) && (
              <div className="map-my-item-badge">✓ 내가 등록한 글</div>
            )}
          </div>
          <button className="map-bottom-panel-button" onClick={handleViewDetail}>
            상세 보기
          </button>
        </div>
      )}

      {/* 하단 등록 버튼 (장소 검색 시) */}
      {selectedPlace && !showBottomPanel && (
        <div className="map-bottom-action">
          <button
            className="map-register-button"
            onClick={handleRegisterClick}
          >
            📍 이 위치로 등록하기
          </button>
        </div>
      )}

      {/* 안내 메시지 (아무것도 선택 안됨) */}
      {!selectedPlace && !showBottomPanel && markers.length === 0 && (
        <div className="map-empty-message">
          <div>🔍 장소를 검색하거나</div>
          <div>등록된 분실물이 없습니다</div>
        </div>
      )}
    </div>
  );
};

export default MapPage;

