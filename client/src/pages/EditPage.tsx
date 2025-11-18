// C:\LostFinderProject\client\src\pages\EditPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { EditMode, LostItem, Theme, User } from '../types';
import { addLostItem, getLostItemById, updateLostItem } from '../utils/api';

interface EditPageProps {
  mode: EditMode;               // 'edit' | 'create'
  currentUser?: User | null;
  // 아래는 옵션으로 처리해 App.tsx에서 미전달 시에도 컴파일/런타임 모두 OK
  onUpdateItem?: (updatedItem: LostItem) => Promise<boolean>;
  onAddItem?: (newItem: Omit<LostItem, 'id' | 'author_id' | 'comments'>) => Promise<boolean>;
  showToastMessage?: (msg: string) => void;
  theme?: Theme;
}

const EditPage: React.FC<EditPageProps> = ({
  mode,
  currentUser,
  onUpdateItem,
  onAddItem,
  showToastMessage,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [itemType, setItemType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    (async () => {
      if (mode === 'edit' && id) {
        const existing = await getLostItemById(id);
        setItemType(existing.item_type || existing.title || '');
        setDescription(existing.description || '');
        setLocation(existing.location || '');
      }
    })();
  }, [mode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'edit' && id) {
      const updated: LostItem = {
        id: Number(id),                  // ✔ 숫자 변환
        title: itemType || '',
        description,
        item_type: itemType || '',
        location,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        image_urls: [],
        author_id: currentUser?.id || '',
        comments: [],
      };

      // 전달된 핸들러 우선, 없으면 updateLostItem 사용
      const ok = (await onUpdateItem?.(updated)) ?? !!(await updateLostItem(String(id), {
        item_type: itemType.trim(),
        description: description.trim(),
        location: location.trim()
      }));
      showToastMessage?.(ok ? '수정되었습니다.' : '수정 실패');
      if (ok) navigate(`/detail/${id}`);
      return;
    }

    // create
    const newItem: Omit<LostItem, 'id' | 'author_id' | 'comments'> = {
      title: itemType || '',
      description,
      item_type: itemType || '',
      location,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      image_urls: [],
    };

    const ok = (await onAddItem?.(newItem)) ?? !!(await addLostItem({ ...newItem, author_id: currentUser?.id || '' }));
    showToastMessage?.(ok ? '등록되었습니다.' : '등록 실패');
    if (ok) navigate('/list');
  };

  return (
    <div style={{ paddingBottom: 92 }}>
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="white-bg" style={{ padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}>
            {mode === 'edit' ? '분실물 수정' : '분실물 등록'}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                분실물 종류
              </label>
              <input
                type="text"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="예: 지갑"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                분실 위치
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 서울 종로구 세종대로 110"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                설명 (선택)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="분실물에 대한 자세한 설명을 입력하세요"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={!itemType || !location}
              style={{
                background: !itemType || !location ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: !itemType || !location ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (itemType && location) {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (itemType && location) {
                  e.currentTarget.style.background = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {mode === 'edit' ? '수정하기' : '등록하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPage;
