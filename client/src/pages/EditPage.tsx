import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import type { LostItem, User } from '../types';
import { getLostItemById, extractCreatedId } from '../utils/api';
import { getDeviceId } from '../utils/deviceId';
import './EditPage.css';
import { resizeAndCompressImage } from '../utils/image';

interface EditPageProps {
  currentUser: User | null;
  onUpdateItem: (item: LostItem) => void;
  onAddItem?: (item: Omit<LostItem, 'id' | 'author_id' | 'comments'>) => void;
  theme: 'light' | 'dark';
}

const EditPage = ({ currentUser, onUpdateItem, onAddItem, theme }: EditPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const locationState = useLocation();
  
  // MapPage에서 전달된 위치 정보
  const mapLocationData = locationState.state as {
    selectedPlace?: {
      name: string;
      address: string;
      lat: number;
      lng: number;
    };
  } | null;
  
  const [itemToEdit, setItemToEdit] = useState<LostItem | null>(null);
  const [itemType, setItemType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 제출 방지
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // 입력 오류 상태
  const [errors, setErrors] = useState({
    itemType: '',
    description: '',
    location: ''
  });

  // 토스트 메시지 표시 함수
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 실시간 입력 검증
  useEffect(() => {
    const newErrors = { ...errors };
    
    if (itemType && !itemType.trim()) {
      newErrors.itemType = '분실물 종류를 선택해주세요';
    } else {
      newErrors.itemType = '';
    }
    
    if (description.length > 0 && description.trim().length < 5) {
      newErrors.description = '최소 5자 이상 입력해주세요';
    } else if (description.length > 1000) {
      newErrors.description = '최대 1000자까지 입력 가능합니다';
    } else {
      newErrors.description = '';
    }
    
    if (location.length > 0 && location.trim().length < 2) {
      newErrors.location = '최소 2자 이상 입력해주세요';
    } else {
      newErrors.location = '';
    }
    
    setErrors(newErrors);
  }, [itemType, description, location]);

  useEffect(() => {
    if (id === 'new') {
      // 새로운 아이템 생성 모드
      setItemToEdit(null);
      setItemType('');
      setDescription('');
      
      // MapPage에서 전달된 위치 정보가 있으면 사용
      if (mapLocationData?.selectedPlace) {
        const { name, address: addr, lat: latitude, lng: longitude } = mapLocationData.selectedPlace;
        setLocation(name);
        setLat(latitude);
        setLng(longitude);
        setPlaceName(name);
        setAddress(addr);
      } else {
        setLocation('');
        setLat(null);
        setLng(null);
        setPlaceName(null);
        setAddress(null);
      }
      
      setImageUrls([]);
      setError(null);
    } else {
      // 기존 아이템 수정 모드
      const fetchItem = async () => {
        try {
          setLoading(true);
          let itemData: LostItem | null = null;
          
          // ✅ 1. localStorage에서 먼저 찾기
          try {
            const stored = localStorage.getItem('lostItems');
            if (stored) {
              const localItems: LostItem[] = JSON.parse(stored);
              itemData = localItems.find(item => item.id === Number(id) || item.id.toString() === id) || null;
              if (itemData) {
                console.log('[EditPage] 로컬에서 찾음:', itemData);
              }
            }
          } catch (e) {
            console.error('[EditPage] localStorage 읽기 실패:', e);
          }
          
          // ✅ 2. localStorage에서 못 찾으면 서버에서 찾기
          if (!itemData) {
            try {
              itemData = await getLostItemById(Number(id));
              console.log('[EditPage] 서버에서 찾음:', itemData);
            } catch (err) {
              throw new Error('게시물을 찾을 수 없습니다');
            }
          }
          
          if (!itemData) {
            throw new Error('게시물을 찾을 수 없습니다');
          }
          
          // 본인 게시물인지 확인 (deviceId 기준)
          const deviceId = getDeviceId();
          const isMyItem = itemData.created_by_device_id === deviceId || currentUser?.id === itemData.author_id;
          
          if (!isMyItem) {
            showToastMessage('수정 권한이 없습니다', 'error');
            navigate('/list');
            return;
          }
          
          setItemToEdit(itemData);
          setItemType(itemData.item_type);
          setDescription(itemData.description);
          setLocation(itemData.location);
          setLat(itemData.lat ?? null);
          setLng(itemData.lng ?? null);
          setPlaceName(itemData.place_name ?? null);
          setAddress(itemData.address ?? null);
          setImageUrls(itemData.image_urls || []);
          setError(null);
        } catch (err) {
          console.error('분실물 조회 실패:', err);
          setError('분실물 정보를 불러오는데 실패했습니다');
          showToastMessage(err instanceof Error ? err.message : '게시물을 찾을 수 없습니다', 'error');
          setTimeout(() => navigate('/list'), 1500);
        } finally {
          setLoading(false);
        }
      };

      fetchItem();
    }
  }, [id, currentUser, navigate, mapLocationData]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setIsUploading(true);
      const files = Array.from(event.target.files);

      try {
        const compressedImages = await Promise.all(
          files.map(file => resizeAndCompressImage(file))
        );
        setImageUrls(prevUrls => [...prevUrls, ...compressedImages]);
        showToastMessage('파일이 업로드되었습니다');
      } catch (error) {
        console.error("파일 처리 중 오류:", error);
        showToastMessage("파일 처리 중 오류가 발생했습니다", 'error');
      } finally {
        setIsUploading(false);
      }
      
      event.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
    showToastMessage('파일이 삭제되었습니다');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 중복 제출 방지
    if (isSubmitting) {
      console.log('[제출] 이미 처리 중입니다');
      return;
    }
    
    // 최종 검증
    if (!itemType.trim()) {
      showToastMessage('분실물 종류를 선택해주세요', 'error');
      return;
    }
    
    if (!description.trim() || description.trim().length < 5) {
      showToastMessage('상세 설명을 5자 이상 입력해주세요', 'error');
      return;
    }
    
    if (!location.trim() || location.trim().length < 2) {
      showToastMessage('분실 장소를 2자 이상 입력해주세요', 'error');
      return;
    }
    
    if (id === 'new') {
      // 새로운 아이템 생성
      setIsSubmitting(true);
      console.log('[등록 시작] 분실물 등록 요청');
      
      try {
        const deviceId = getDeviceId();
        
        // ✅ 좌표가 없으면 기본 좌표 설정 (서울시청)
        const defaultLat = lat || 37.5665;
        const defaultLng = lng || 126.9780;
        
        const newItem = {
          item_type: itemType.trim(),
          description: description.trim(),
          location: location.trim(),
          lat: defaultLat,
          lng: defaultLng,
          place_name: placeName || location.trim(),
          address: address || location.trim(),
          lost_at: new Date().toISOString(),
          created_by_device_id: deviceId,
          image_urls: imageUrls,
        };
        
        // API 직접 호출
        const response = await fetch('/api/lost-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log('[등록 성공]', data);
          
          // ✅ localStorage에 저장 (Vercel stateless 해결)
          const savedItem = {
            ...data.item,
            id: data.item.id || Date.now(),
          };
          
          try {
            const existingItems = JSON.parse(localStorage.getItem('lostItems') || '[]');
            existingItems.push(savedItem);
            localStorage.setItem('lostItems', JSON.stringify(existingItems));
            console.log('[로컬 저장 성공]', savedItem);
          } catch (error) {
            console.error('[로컬 저장 실패]', error);
          }
          
          // 성공 토스트 표시
          showToastMessage('분실물이 등록되었습니다');
          
          // ✅ Vercel Serverless는 stateless이므로 항상 목록으로 이동
          setTimeout(() => {
            console.log('[리다이렉트] 목록 페이지로 이동');
            navigate('/list');
          }, 1000);
          return; // ✅ 성공 후 종료 (실패 토스트가 뜨지 않음)
        } else {
          // API는 성공했지만 success=false
          console.error('[등록 실패] 서버 응답:', data);
          showToastMessage(data.message || '등록에 실패했습니다', 'error');
          setIsSubmitting(false);
          return; // ✅ 실패 후 종료 (폼 유지)
        }
      } catch (error) {
        // 네트워크 오류 또는 예외
        console.error('[등록 실패] 예외 발생:', error);
        showToastMessage('등록 중 오류가 발생했습니다', 'error');
        setIsSubmitting(false);
        return;
      }
    } else {
      // 기존 아이템 수정
      if (!itemToEdit) return;
      
      setIsSubmitting(true);
      console.log('[수정 시작] 분실물 수정 요청');

      try {
        const updatedItem = {
          ...itemToEdit,
          item_type: itemType.trim(),
          description: description.trim(),
          location: location.trim(),
          lat: lat,
          lng: lng,
          place_name: placeName,
          address: address,
          image_urls: imageUrls,
        };
        
        // ✅ localStorage 업데이트
        try {
          const stored = localStorage.getItem('lostItems');
          if (stored) {
            const localItems: LostItem[] = JSON.parse(stored);
            const index = localItems.findIndex(item => item.id === itemToEdit.id);
            if (index !== -1) {
              localItems[index] = updatedItem;
              localStorage.setItem('lostItems', JSON.stringify(localItems));
              console.log('[수정 완료] localStorage 업데이트');
            }
          }
        } catch (e) {
          console.error('[수정 실패] localStorage 업데이트 오류:', e);
        }
        
        onUpdateItem(updatedItem);
        console.log('[수정 성공]');
        showToastMessage('분실물 정보가 수정되었습니다');
        
        setTimeout(() => navigate(`/detail/${itemToEdit.id}`), 1000);
        return; // 성공 후 종료
      } catch (error) {
        console.error('[수정 실패] 예외 발생:', error);
        showToastMessage('수정 중 오류가 발생했습니다', 'error');
        setIsSubmitting(false);
        return;
      }
    }
  };

  if (loading) {
    return (
      <div className="edit-page-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-page-container">
        <div className="edit-form">
          <p style={{ color: '#e53e3e', textAlign: 'center' }}>{error}</p>
        </div>
      </div>
    );
  }

  const isFormValid = itemType.trim() && description.trim().length >= 5 && location.trim().length >= 2;

  return (
    <div className="edit-page-container">
      {/* 토스트 메시지 */}
      {showToast && (
        <div className={`toast-notification ${toastType}`}>
          {toastMessage}
        </div>
      )}

      {/* 헤더 */}
      <div className="edit-page-header">
        <h1 className="edit-page-title">
          {id === 'new' ? '분실물 등록' : '분실물 정보 수정'}
        </h1>
        <p className="edit-page-subtitle">
          {id === 'new' ? '분실물 정보를 자세히 입력해주세요' : '수정할 정보를 입력해주세요'}
        </p>
      </div>
      
      {/* 제출 중 알림 */}
      {isSubmitting && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 16px',
          padding: '12px',
          background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
          border: '2px solid #667eea',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#4c51bf',
          fontWeight: 600
        }}>
          {id === 'new' ? '등록 중입니다...' : '수정 중입니다...'}
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="edit-form">
        {/* 분실물 종류 */}
        <div className="edit-form-group">
          <label htmlFor="itemType" className="edit-form-label">
            분실물 종류 <span className="required">*</span>
          </label>
          <select
            id="itemType"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className={`edit-select ${errors.itemType ? 'has-error' : ''}`}
          >
            <option value="">선택해주세요</option>
            <option value="자전거">자전거</option>
            <option value="킥보드">킥보드</option>
            <option value="택배">택배</option>
            <option value="기타">기타</option>
          </select>
          {errors.itemType && (
            <div className="edit-form-error">⚠️ {errors.itemType}</div>
          )}
        </div>

        {/* 상세 설명 */}
        <div className="edit-form-group">
          <label htmlFor="description" className="edit-form-label">
            상세 설명 <span className="required">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="분실물의 특징, 색상, 모델 등을 자세히 입력해주세요..."
            className={`edit-textarea ${errors.description ? 'has-error' : ''}`}
            maxLength={1000}
          />
          <div className={`character-counter ${description.length > 900 ? 'warning' : ''} ${description.length === 1000 ? 'error' : ''}`}>
            {description.length}/1000자
          </div>
          {errors.description && (
            <div className="edit-form-error">⚠️ {errors.description}</div>
          )}
        </div>

        {/* 분실 장소 */}
        <div className="edit-form-group">
          <label htmlFor="location" className="edit-form-label">
            분실 장소 <span className="required">*</span>
          </label>
          
          <div className="location-section">
            {/* 지도에서 선택한 위치 표시 */}
            {lat && lng && (
              <div className="location-selected-box">
                <div className="location-selected-header">
                  ✓ 지도에서 선택한 위치
                </div>
                <div className="location-selected-content">
                  <div className="location-selected-item">
                    <strong>장소</strong> {placeName || location}
                  </div>
                  {address && (
                    <div className="location-selected-item">
                      <strong>주소</strong> {address}
                    </div>
                  )}
                  <div className="location-coordinates">
                    좌표: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </div>
                </div>
                <Link to="/map" className="location-change-btn">
                  위치 변경하기
                </Link>
              </div>
            )}
            
            {/* 텍스트 입력 */}
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 남사중학교 정문"
              className={`edit-input ${errors.location ? 'has-error' : ''}`}
            />
          </div>
          
          {errors.location && (
            <div className="edit-form-error">⚠️ {errors.location}</div>
          )}
        </div>

        {/* 파일 업로드 */}
        <div className="edit-form-group">
          <label className="edit-form-label">
            파일 등록 (선택사항)
          </label>
          <div className="photo-upload-section">
            <input
              type="file"
              id="photo-input"
              accept="image/*"
              onChange={handleImageUpload}
              multiple
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="photo-input" 
              className={`photo-upload-btn ${isUploading ? 'disabled' : ''}`}
              style={isUploading ? { pointerEvents: 'none' } : {}}
            >
              <span>📁</span>
              <span>{isUploading ? '처리 중...' : '파일 추가'}</span>
            </label>
            {isUploading && (
              <div className="uploading-indicator">
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                <span>파일 처리 중...</span>
              </div>
            )}
            <div className="photo-upload-helper">
              최대 10장, JPG/PNG 형식, 각 5MB 이하
            </div>
          </div>

          {/* 파일 미리보기 */}
          {imageUrls.length > 0 && (
            <div className="photo-preview-grid">
              {imageUrls.map((url, index) => (
                <div key={index} className="photo-preview-item">
                  <img src={url} alt={`미리보기 ${index + 1}`} className="photo-preview-img" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="photo-remove-btn"
                    aria-label="파일 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div className="edit-button-group">
          <button
            type="submit"
            className="edit-submit-btn"
            disabled={!isFormValid || isUploading || isSubmitting}
          >
            {isSubmitting ? (id === 'new' ? '등록 중...' : '수정 중...') : 
             isUploading ? '파일 처리 중...' : 
             (id === 'new' ? '등록 완료' : '수정 완료')}
          </button>
          <Link 
            to="/list" 
            className="edit-cancel-btn"
            onClick={(e) => {
              if (isSubmitting) {
                e.preventDefault();
                alert('처리 중입니다. 잠시만 기다려주세요.');
              }
            }}
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditPage;
