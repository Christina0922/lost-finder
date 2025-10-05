// C:\LostFinderProject\client\src\pages\DetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import KakaoMapComponent from '../components/KakaoMapComponent';
import type { LostItem, Comment, User } from '../types';
import { getLostItemById, addComment } from '../utils/api';
import CoupangBanner from '../components/CoupangBanner'; // ✅ 추가

interface DetailPageProps {
  currentUser: User;
}

const DetailPage: React.FC<DetailPageProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<LostItem | null>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const found = await getLostItemById(id);
        setItem(found);
      } catch (error) {
        console.error('아이템을 불러오는 중 오류:', error);
      }
    })();
  }, [id]);

  const handleAddComment = async () => {
    if (!id || !text.trim()) return;

    try {
      await addComment(id, { text: text.trim() });
      
      // 댓글 등록 성공 알림
      alert('댓글이 등록되었습니다! 분실물 주인에게 알림이 전송되었습니다.');
      
      // 페이지 새로고침으로 댓글 목록 업데이트
      window.location.reload();
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert('댓글 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (!item) return <div style={{ padding: 16 }}>불러오는 중…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{item.title || item.item_type || '분실물 상세'}</h2>

      <div className="item-info">
        <p><strong>분실물 종류:</strong> {item.item_type || ''}</p>
        <p><strong>분실 위치:</strong> {item.location || ''}</p>
        <p><strong>등록일:</strong> {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</p>
      </div>

      <div style={{ margin: '16px 0' }}>
        <KakaoMapComponent
          location={item.location || ''}     // ✔ string 보장
          itemType={item.item_type || ''}    // ✔ string 보장
          description={item.description || ''}
        />
      </div>

      <div>
        <h3>댓글</h3>
        {item.comments?.map((comment: Comment) => (
          <div key={comment.id} className="comment">
            <p><strong>{comment.author_name || '익명'}:</strong> {comment.text}</p>
            <small>{comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}</small>
          </div>
        ))}

        <div style={{ marginTop: 8 }}>
          <input
            placeholder="댓글을 입력하세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleAddComment}>등록</button>
        </div>
      </div>

      {/* ✅ 쿠팡 배너 추가 (1시간마다 자동 교체, 1개만 표시) */}
      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <CoupangBanner />
      </div>
    </div>
  );
};

export default DetailPage;
