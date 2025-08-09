// C:\LostFinderProject\client\src\pages\DetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import KakaoMapComponent from '../components/KakaoMapComponent';
import type { LostItem, Comment, User } from '../types';
import { getLostItemById, addComment } from '../utils/api';
import './DetailPage.css';

interface DetailPageProps {
  currentUser: User | null;
}

const DetailPage: React.FC<DetailPageProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<LostItem | null>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      const found = await getLostItemById(Number(id));
      setItem(found);
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !text.trim() || !currentUser) return;

    const c: Omit<Comment, 'id' | 'created_at'> = {
      author_id: currentUser.id,
      author_name: currentUser.username,
      author_email: currentUser.email,
      text: text.trim(),
    };
    await addComment(Number(id), c);
    
    // 댓글 등록 후 초기 화면으로 돌아가기
    window.location.href = '/';
  };

  if (!item) return <div>로딩 중...</div>;

  return (
    <div className="detail-page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', padding: '8px 12px', backgroundColor: '#007bff', borderRadius: '4px' }}>
        <button 
          onClick={() => window.history.back()} 
          style={{ 
            marginRight: '12px', 
            padding: '4px 8px', 
            border: 'none', 
            borderRadius: '4px', 
            backgroundColor: 'transparent', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← 뒤로
        </button>
        <h1 style={{ margin: 0, color: 'white', fontSize: '18px' }}>{item.description}</h1>
      </div>
      
      <div className="item-info">
        <p><strong>분실물 종류:</strong> {item.item_type}</p>
        <p><strong>분실 위치:</strong> {item.location}</p>
        <p><strong>등록일:</strong> {new Date(item.created_at || '').toLocaleDateString()}</p>
      </div>

      {/* 위치가 필요하면 KakaoMapComponent 사용 */}
      <div style={{ margin: '16px 0' }}>
        <KakaoMapComponent 
          location={item.location}
          itemType={item.item_type}
          description={item.description || ''}
        />
      </div>

      <h2>댓글</h2>
      <div className="comments">
        {item.comments?.map((comment) => (
          <div key={comment.id} className="comment">
            <p><strong>{comment.author_name || '익명'}:</strong> {comment.text}</p>
            <small>{new Date(comment.created_at || '').toLocaleDateString()}</small>
          </div>
        ))}
      </div>

      {currentUser && (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            required
          />
          <button type="submit">댓글 작성</button>
        </form>
      )}
    </div>
  );
};

export default DetailPage;
