import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { LostItem, User } from '../App';
import './RegisterPage.css'; // 등록 페이지와 동일한 스타일 사용
import { resizeAndCompressImage } from '../utils/image';

interface EditPageProps {
  items: LostItem[];
  currentUser: User | null;
  onUpdateItem: (item: LostItem) => void;
}

const EditPage: React.FC<EditPageProps> = ({ items, currentUser, onUpdateItem }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [itemToEdit, setItemToEdit] = useState<LostItem | null>(null);
  const [itemType, setItemType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const foundItem = items.find(i => i.id === Number(id));
    if (foundItem) {
      // 본인 게시물인지 확인
      if (currentUser?.id !== foundItem.authorId) {
        alert('수정 권한이 없습니다.');
        navigate('/list');
        return;
      }
      setItemToEdit(foundItem);
      setItemType(foundItem.itemType);
      setDescription(foundItem.description);
      setLocation(foundItem.location);
      setImageUrls(foundItem.imageUrls || []);
    } else {
      alert('게시물을 찾을 수 없습니다.');
      navigate('/list');
    }
  }, [id, items, currentUser, navigate]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    const updatedItem = {
      ...itemToEdit,
      itemType,
      description,
      location,
      imageUrls,
    };
    onUpdateItem(updatedItem);
    alert('수정되었습니다.');
    navigate('/list');
  };

  if (!itemToEdit) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="form-container-wrapper">
      <h1>분실물 정보 수정</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="itemType">분실물 종류</label>
          <input
            type="text"
            id="itemType"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">상세 설명</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">분실 장소</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="item-photo">사진 수정 (새 파일 추가 또는 기존 파일 삭제)</label>
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
            {isUploading ? "업로드 대기 중..." : "수정 완료"}
          </button>
          <Link to="/list" className="button-secondary">취소하고 목록으로</Link>
        </div>
      </form>
    </div>
  );
};

export default EditPage; 