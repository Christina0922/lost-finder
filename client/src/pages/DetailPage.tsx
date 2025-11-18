// C:\LostFinderProject\client\src\pages\DetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KakaoMapComponent from '../components/KakaoMapComponent';
import type { LostItem, Comment, User } from '../types';
import { getLostItemById, addComment, deleteLostItem } from '../utils/api';
import { getCoords } from '../utils/geocode';
import CoupangBanner from '../components/CoupangBanner'; // ✅ 추가

interface DetailPageProps {
  currentUser: User;
}

const DetailPage: React.FC<DetailPageProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<LostItem | null>(null);
  const [text, setText] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const found = await getLostItemById(id);
        setItem(found);
        
        // 주소를 좌표로 변환
        if (found && found.location) {
          console.log('📍 주소 좌표 변환 시도:', found.location);
          const coord = await getCoords(found.location);
          if (coord) {
            console.log('✅ 좌표 변환 성공:', coord);
            setCoords(coord);
          } else {
            console.warn('⚠️ 좌표 변환 실패:', found.location);
          }
        }
      } catch (error) {
        console.error('아이템을 불러오는 중 오류:', error);
      }
    })();
  }, [id]);

  // 본인 소유 여부 판단
  const isOwner = useCallback(() => {
    if (!currentUser || !item) return false;
    const uid = (currentUser as any).id ?? (currentUser as any).user_id ?? (currentUser as any).userId;
    const uemail = (currentUser as any).email ?? (currentUser as any).username;

    const ownerId = (item as any).user_id ?? (item as any).userId ?? (item as any).owner_id ?? (item as any).author_id;
    const ownerEmail = (item as any).owner_email ?? (item as any).author_email ?? (item as any).email;

    // ID 비교 (문자열/숫자 모두 지원)
    const idMatch = uid != null && ownerId != null && (
      String(uid) === String(ownerId) || 
      Number(uid) === Number(ownerId)
    );
    
    // Email 비교
    const emailMatch = uemail && ownerEmail && 
      String(uemail).toLowerCase() === String(ownerEmail).toLowerCase();

    return idMatch || emailMatch;
  }, [currentUser, item]);

  const handleDelete = async () => {
    if (!id || !window.confirm('정말 삭제하시겠어요? 삭제 후 되돌릴 수 없습니다.')) return;
    
    try {
      setIsDeleting(true);
      await deleteLostItem(id);
      alert('삭제되었습니다.');
      navigate('/list');
    } catch (error: any) {
      console.error('삭제 실패:', error);
      alert(error?.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async () => {
    if (!id || !text.trim()) return;

    try {
      console.log('💬 댓글 등록 시도:', { id, text: text.trim() });
      const result = await addComment(id, { text: text.trim() });
      console.log('✅ 댓글 등록 성공:', result);
      
      // 댓글 등록 성공 알림
      alert('댓글이 등록되었습니다! 분실물 주인에게 알림이 전송되었습니다.');
      
      // 입력 필드 초기화
      setText('');
      
      // 아이템 다시 불러오기
      const found = await getLostItemById(id);
      setItem(found);
    } catch (error: any) {
      console.error('❌ 댓글 등록 실패:', error);
      const errorMessage = error?.message || '댓글 등록에 실패했습니다. 서버가 실행 중인지 확인해주세요.';
      alert(errorMessage);
    }
  };

  if (!item) return <div style={{ padding: 16 }}>불러오는 중…</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>{item.title || item.item_type || '분실물 상세'}</h2>
        
        {/* 본인 글일 때만 수정/삭제 버튼 표시 */}
        {isOwner() && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate(`/edit/${id}`)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '0',
                background: '#ef4444',
                color: '#fff',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: isDeleting ? 0.6 : 1
              }}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

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
          coords={coords}                    // 좌표 전달
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
