import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LostItem } from '../App';
import './RegisterPage.css';

interface RegisterPageProps {
  currentUser: User | null;
  onAddItem: (item: Omit<LostItem, 'id' | 'author_id' | 'comments'>) => Promise<boolean>;
  theme: 'light' | 'dark';
}

const RegisterPage: React.FC<RegisterPageProps> = ({ currentUser, onAddItem, theme }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item_type: '',
    description: '',
    location: '',
    image_urls: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!formData.item_type || !formData.description || !formData.location) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddItem(formData);
      alert('분실물이 성공적으로 등록되었습니다!');
      navigate('/list');
    } catch (error) {
      alert('등록 중 오류가 발생했습니다.');
      console.error('Error adding item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className={`register-page ${theme}`}>
      <div className="register-container">
        {/* 헤더 */}
        <div className="register-header">
          <button className="back-button" onClick={handleBack}>
            ← 뒤로가기
          </button>
          <h1>분실물 등록</h1>
        </div>

        {/* 등록 폼 */}
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item_type">물건 종류 *</label>
            <select
              id="item_type"
              name="item_type"
              value={formData.item_type}
              onChange={handleInputChange}
              required
            >
              <option value="">선택해주세요</option>
              <option value="전자기기">전자기기</option>
              <option value="지갑/카드">지갑/카드</option>
              <option value="가방">가방</option>
              <option value="의류">의류</option>
              <option value="서류">서류</option>
              <option value="열쇠">열쇠</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">상세 설명 *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="잃어버린 물건에 대한 자세한 설명을 입력해주세요..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">분실 위치 *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="예: 서울역 1번 출구, 강남역 지하철..."
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>

      {/* 하단 고정 쿠팡 광고 */}
      <div className="ad-banner">
        <div className="ad-content">
          <div className="ad-icon">🔍</div>
          <div className="ad-text">
            <h4>놓치지 마세요! 분실 방지 용품 인기 상품 모음 👀</h4>
            <p>내 소지품을 지키는 스마트한 아이템 모음</p>
          </div>
          <button className="ad-button">쿠팡에서 보기</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 