import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LostItem, User } from '../App';
import './RegisterPage.css';
import { resizeAndCompressImage } from '../utils/image';

// RegisterPage가 받을 props의 타입을 정의합니다.
interface RegisterPageProps {
  onAddItem: (item: Omit<LostItem, 'id' | 'authorId' | 'comments'>) => void;
  currentUser: User | null;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onAddItem, currentUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리디렉션
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const [itemType, setItemType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setIsUploading(true);
      const files = Array.from(event.target.files);
      
      try {
        const compressedImages = await Promise.all(
          files.map(file => resizeAndCompressImage(file))
        );
        setImageUrls(prevUrls => [...prevUrls, ...compressedImages]);
      } catch (error) {
        console.error("이미지 처리 중 오류 발생:", error);
        alert("이미지를 처리하는 중 오류가 발생했습니다. 다른 파일을 시도해 주세요.");
      } finally {
        setIsUploading(false);
      }
      
      event.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    onAddItem({ itemType, description, location, imageUrls });

    // 입력 필드 초기화
    setItemType('');
    setDescription('');
    setLocation('');
    setImageUrls([]);

    alert('등록되었습니다!');
    navigate('/list'); // 등록 후 목록 페이지로 이동
  };

  // 로그인한 사용자가 없으면 렌더링하지 않음 (리디렉션 전 잠시 보이는 것 방지)
  if (!currentUser) {
    return null;
  }

  return (
    <div>
      <h1>분실물 등록하기</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <label htmlFor="item-type">종류</label>
          <select id="item-type" value={itemType} onChange={(e) => setItemType(e.target.value)} required>
            <option value="">분실물 종류를 선택하세요</option>
            <option value="킥보드">킥보드</option>
            <option value="자전거">자전거</option>
            <option value="택배">택배</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div>
          <label htmlFor="description">상세 설명</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="색상, 모델명, 특징 등을 자세히 적어주세요." rows={4} required />
        </div>
        <div>
          <label htmlFor="lost-location">분실 장소</label>
          <input type="text" id="lost-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="예: OO공원 정문" required />
        </div>
        <div>
          <label htmlFor="item-photo">사진 등록 (여러 장 가능)</label>
          <input type="file" id="item-photo" accept="image/*" onChange={handleImageUpload} multiple disabled={isUploading} />
          {isUploading && <p>이미지를 최적화하는 중...</p>}
          <div className="image-preview-container">
            {imageUrls.map((url, index) => (
              <div key={index} className="image-preview-item">
                <img src={url} alt={`미리보기 ${index + 1}`} />
                <button type="button" onClick={() => handleRemoveImage(index)} className="remove-image-button">X</button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isUploading}>
            {isUploading ? "업로드 대기 중..." : "등록하기"}
          </button>
          <Link to="/list" className="button-secondary">취소하고 목록으로</Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage; 