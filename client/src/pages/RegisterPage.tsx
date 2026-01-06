import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LostItem, User } from '../App';
import GlobalMonetizationCard from '../components/GlobalMonetizationCard';
import './RegisterPage.css';
import { resizeAndCompressImage } from '../utils/image';

// RegisterPage가 받을 props의 타입을 정의합니다.
interface RegisterPageProps {
  onAddItem: (item: Omit<LostItem, 'id' | 'author_id' | 'comments'>) => void;
  currentUser: User | null;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onAddItem, currentUser }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

    onAddItem({ item_type: itemType, description, location, image_urls: imageUrls });

    // 입력 필드 초기화
    setItemType('');
    setDescription('');
    setLocation('');
    setImageUrls([]);

    alert(t('registerPage.registered'));
    navigate('/list'); // 등록 후 목록 페이지로 이동
  };

  return (
    <div>
      <h1>{t('registerPage.title')}</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <label htmlFor="item-type">{t('registerPage.itemType')}</label>
          <select id="item-type" value={itemType} onChange={(e) => setItemType(e.target.value)} required>
            <option value="">{t('registerPage.itemTypePlaceholder')}</option>
            <option value="킥보드">{t('itemTypes.kickboard')}</option>
            <option value="자전거">{t('itemTypes.bicycle')}</option>
            <option value="택배">{t('itemTypes.package')}</option>
            <option value="기타">{t('itemTypes.other')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="description">{t('registerPage.description')}</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('registerPage.descriptionPlaceholder')} rows={4} required />
        </div>
        <div>
          <label htmlFor="lost-location">{t('registerPage.location')}</label>
          <input type="text" id="lost-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('registerPage.locationPlaceholder')} required />
        </div>
        <div>
          <label htmlFor="item-photo">{t('registerPage.photos')}</label>
          <input type="file" id="item-photo" accept="image/*" onChange={handleImageUpload} multiple disabled={isUploading} />
          {isUploading && <p>{t('registerPage.uploading')}</p>}
          <div className="image-preview-container">
            {imageUrls.map((url, index) => (
              <div key={index} className="image-preview-item">
                <img src={url} alt={`미리보기 ${index + 1}`} />
                <button type="button" onClick={() => handleRemoveImage(index)} className="remove-image-button">X</button>
              </div>
            ))}
          </div>
        </div>
        <div className="button-group">
          <button type="submit" className="btn primary" disabled={isUploading}>
            {isUploading ? t('registerPage.uploadWait') : t('registerPage.registerButton')}
          </button>
          <Link to="/list" className="btn secondary">{t('registerPage.cancelToList')}</Link>
        </div>
      </form>
      
      {/* 아마존 어소시에이트 수익화 카드 */}
      <GlobalMonetizationCard />
    </div>
  );
}

export default RegisterPage; 