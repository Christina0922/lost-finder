// C:\LostFinderProject\client\src\pages\EditPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { EditMode, LostItem, Theme, User } from '../types';

interface EditPageProps {
  mode: EditMode; // 'edit' | 'create'
  currentUser: User | null;
  onUpdateItem: (updatedItem: LostItem) => Promise<boolean>;
  onAddItem: (
    item: Omit<LostItem, 'id' | 'author_id' | 'comments'>
  ) => Promise<boolean>;
  showToastMessage: (msg: string) => void;
  theme: Theme;
  initialItem?: Partial<LostItem>;
}

const EditPage: React.FC<EditPageProps> = ({
  mode,
  currentUser,
  onUpdateItem,
  onAddItem,
  showToastMessage,
  theme,
  initialItem,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 폼 상태
  const [itemType, setItemType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // 초기값 설정
  useEffect(() => {
    if (mode === 'edit' && initialItem) {
      setItemType(initialItem.item_type || '');
      setDescription(initialItem.description || '');
      setLocation(initialItem.location || '');
    }
  }, [mode, initialItem]);

  const pageTitle = useMemo(
    () => (mode === 'edit' ? '분실물 수정' : '분실물 등록'),
    [mode]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToastMessage('로그인이 필요합니다.');
      return;
    }

    if (mode === 'edit' && id) {
      const updated: LostItem = {
        id: Number(id),
        item_type: itemType,
        description,
        location,
        author_id: currentUser.id,
        image_urls: [],
        comments: []
      };
      const ok = await onUpdateItem(updated);
      showToastMessage(ok ? '수정 완료' : '수정 실패');
      if (ok) navigate(-1);
    } else {
      const ok = await onAddItem({
        item_type: itemType,
        description,
        location,
        image_urls: []
      });
      showToastMessage(ok ? '등록 완료' : '등록 실패');
      if (ok) navigate(-1);
    }
  };

  return (
    <div data-theme={theme} style={{ padding: 16, maxWidth: 640, margin: '0 auto' }}>
      <h1>{pageTitle}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>물건 종류</label>
          <select
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">선택하세요</option>
            <option value="자전거">자전거</option>
            <option value="킥보드">킥보드</option>
            <option value="택배">택배</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: '100%', padding: 8, minHeight: 120 }}
            placeholder="장소, 시간 등 상세정보"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>분실 위치</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
            placeholder="예: 서울역 1번 출구"
          />
        </div>
        <button type="submit" style={{ padding: '10px 16px' }}>
          {mode === 'edit' ? '수정하기' : '등록하기'}
        </button>
      </form>
    </div>
  );
};

export default EditPage;
