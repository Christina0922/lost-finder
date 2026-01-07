import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import type { LostItem, User } from '../types';
import { getLostItemById } from '../utils/api';
import { getDeviceId } from '../utils/deviceId';
import './RegisterPage.css'; // 등록 페이지와 동일한 스타일 사용
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
    location?: string;
    lat?: number;
    lng?: number;
    place_name?: string;
    address?: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // 토스트 메시지 표시 함수
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 입력값 검증 함수
  const validateInputs = () => {
    if (!itemType.trim()) {
      showToastMessage('분실물 종류를 선택해주세요.', 'error');
      return false;
    }
    
    if (!description.trim()) {
      showToastMessage('상세 설명을 입력해주세요.', 'error');
      return false;
    }
    
    if (description.trim().length < 5) {
      showToastMessage('상세 설명은 최소 5자 이상 입력해주세요.', 'error');
      return false;
    }
    
    if (!location.trim()) {
      showToastMessage('분실 장소를 입력해주세요.', 'error');
      return false;
    }
    
    if (location.trim().length < 2) {
      showToastMessage('분실 장소는 최소 2자 이상 입력해주세요.', 'error');
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    if (id === 'new') {
      // 새로운 아이템 생성 모드
      setItemToEdit(null);
      setItemType('');
      setDescription('');
      
      // MapPage에서 전달된 위치 정보가 있으면 사용
      if (mapLocationData) {
        setLocation(mapLocationData.location || '');
        setLat(mapLocationData.lat ?? null);
        setLng(mapLocationData.lng ?? null);
        setPlaceName(mapLocationData.place_name ?? null);
        setAddress(mapLocationData.address ?? null);
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
          const itemData = await getLostItemById(Number(id));
          
          // 본인 게시물인지 확인
          if (currentUser?.id !== itemData.author_id) {
            showToastMessage('수정 권한이 없습니다.', 'error');
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
          setError('분실물 정보를 불러오는데 실패했습니다.');
          showToastMessage('게시물을 찾을 수 없습니다.', 'error');
          navigate('/list');
        } finally {
          setLoading(false);
        }
      };

      fetchItem();
    }
  }, [id, currentUser, navigate]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setIsUploading(true);
      const files = Array.from(event.target.files);

      try {
        const compressedImages = await Promise.all(
          files.map(file => resizeAndCompressImage(file))
        );
        setImageUrls(prevUrls => [...prevUrls, ...compressedImages]);
        showToastMessage('이미지가 성공적으로 업로드되었습니다.');
      } catch (error) {
        console.error("이미지 처리 중 오류 발생:", error);
        showToastMessage("이미지를 처리하는 중 오류가 발생했습니다. 다른 파일을 시도해 주세요.", 'error');
      } finally {
        setIsUploading(false);
      }
      
      event.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
    showToastMessage('이미지가 삭제되었습니다.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!validateInputs()) {
      return;
    }
    
    if (id === 'new') {
      // 새로운 아이템 생성
      if (!onAddItem) {
        showToastMessage('새로운 아이템을 생성할 수 없습니다.', 'error');
        return;
      }
      
      const deviceId = getDeviceId();
      
      const newItem = {
        item_type: itemType.trim(),
        description: description.trim(),
        location: location.trim(),
        lat: lat,
        lng: lng,
        place_name: placeName,
        address: address,
        lost_at: new Date().toISOString(),
        created_by_device_id: deviceId,
        image_urls: imageUrls,
      };
      onAddItem(newItem);
      showToastMessage('분실물이 성공적으로 등록되었습니다!');
      setTimeout(() => navigate('/list'), 1500);
    } else {
      // 기존 아이템 수정
      if (!itemToEdit) return;

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
      onUpdateItem(updatedItem);
      showToastMessage('분실물 정보가 성공적으로 수정되었습니다!');
      setTimeout(() => navigate('/list'), 1500);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="form-container-wrapper">
      <h1>{id === 'new' ? '분실물 등록' : '분실물 정보 수정'}</h1>
      
      {/* 토스트 메시지 */}
      {showToast && (
        <div className={`toast-message ${toastType}`}>
          {toastMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="itemType">분실물 종류 *</label>
          <select
            id="itemType"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            required
            className={itemType.trim() === '' ? 'error' : ''}
          >
            <option value="">분실물 종류를 선택하세요</option>
            <option value="자전거">자전거</option>
            <option value="킥보드">킥보드</option>
            <option value="택배">택배</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">상세 설명 * (최소 5자)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={5}
            placeholder="분실물에 대한 상세한 설명을 입력해주세요..."
            className={description.trim().length < 5 && description.trim() !== '' ? 'error' : ''}
          />
          <div className="character-count">
            {description.length}/1000자
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="location">분실 장소 * (최소 2자)</label>
          
          {/* 지도에서 선택한 위치 정보 표시 */}
          {lat && lng && (
            <div style={{
              background: '#e8f5e9',
              border: '1px solid #4CAF50',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px',
              fontSize: '14px',
            }}>
              <div style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '6px' }}>
                ✓ 지도에서 선택한 위치
              </div>
              <div style={{ color: '#555' }}>
                <div><strong>장소:</strong> {placeName || location}</div>
                <div><strong>주소:</strong> {address || '주소 정보 없음'}</div>
                <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
                  좌표: {lat.toFixed(6)}, {lng.toFixed(6)}
                </div>
              </div>
            </div>
          )}
          
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            minLength={2}
            placeholder="분실한 정확한 장소를 입력해주세요..."
            className={location.trim().length < 2 && location.trim() !== '' ? 'error' : ''}
          />
          
          {/* 지도에서 선택 버튼 */}
          {id === 'new' && !lat && !lng && (
            <div style={{ marginTop: '10px' }}>
              <Link 
                to="/map" 
                style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  background: '#667eea',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
                onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
              >
                🗺️ 지도에서 위치 선택하기
              </Link>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="item-photo" style={{ fontSize: '14px' }}>사진 {id === 'new' ? '업로드' : '수정'} (선택사항)</label>
          <input type="file" id="item-photo" accept="image/*" onChange={handleImageUpload} multiple disabled={isUploading} />
          {isUploading && <p className="upload-status">이미지를 최적화하는 중...</p>}
          <div className="image-preview-container">
            {imageUrls.map((url, index) => (
              <div key={index} className="image-preview-item">
                <img src={url} alt={`미리보기 ${index + 1}`} />
                <button type="button" onClick={() => handleRemoveImage(index)} className="remove-image-button">X</button>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          alignItems: 'center',
          width: '100%'
        }}>
          <button type="submit" className="submit-button" disabled={isUploading} style={{ width: '100%' }}>
            {isUploading ? "업로드 대기 중..." : (id === 'new' ? "등록 완료" : "수정 완료")}
          </button>
          <Link to="/list" className="button-secondary" style={{ width: '100%' }}>취소하고 목록으로</Link>
        </div>
      </form>
    </div>
  );
};

export default EditPage; 