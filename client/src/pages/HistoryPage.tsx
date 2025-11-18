import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LostItem, User } from '../types';
import { getAllLostItems, deleteLostItem } from '../utils/api';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

interface HistoryPageProps {
  currentUser?: User | null;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await getAllLostItems();
        // 현재 사용자가 등록한 분실물만 필터링 (ListPage와 동일한 로직)
        const userItems = data.filter((item: LostItem) => {
          if (!currentUser) return false;
          
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
        });
        setItems(userItems);
      } catch (error) {
        console.error('내 기록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadItems();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('정말 삭제하시겠어요? 삭제 후 되돌릴 수 없습니다.')) return;
    try {
      setBusyId(id);
      await deleteLostItem(id);
      setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
      alert('삭제되었습니다.');
    } catch (e: any) {
      alert(e?.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ paddingBottom: 92 }}>
        <TopBar isLoggedIn={!!currentUser} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>로그인이 필요합니다</h2>
          <p>내 기록을 보려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} />
      
      <div style={{ padding: '16px' }}>
        <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>
          📚 내 기록
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            로딩 중...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px', color: '#666' }}>
              등록한 분실물: {items.length}개
            </div>
            
            {items.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#666',
                background: '#f9f9f9',
                borderRadius: '8px'
              }}>
                아직 등록한 분실물이 없습니다.
                <br />
                분실물을 등록해보세요!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        {item.description}
                      </p>
                    )}
                    {item.location && (
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888' }}>
                        📍 {item.location}
                      </p>
                    )}
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      등록일: {item.created_at ? new Date(item.created_at).toLocaleDateString() : '알 수 없음'}
                    </div>
                    {item.comments && item.comments.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#007bff', marginTop: '8px' }}>
                        💬 댓글 {item.comments.length}개
                      </div>
                    )}
                    
                    {/* 수정/삭제 메뉴 */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #e0e0e0'
                    }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/edit/${item.id}`)}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: '8px', 
                          border: '1px solid #d1d5db', 
                          background: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          flex: 1
                        }}
                      >
                        ✏️ 수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id!)}
                        disabled={busyId === item.id}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: '8px', 
                          border: '0', 
                          background: '#ef4444', 
                          color: '#fff',
                          cursor: busyId === item.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          opacity: busyId === item.id ? 0.6 : 1,
                          flex: 1
                        }}
                      >
                        {busyId === item.id ? '삭제 중…' : '🗑️ 삭제'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/detail/${item.id}`)}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: '8px', 
                          border: '1px solid #007bff', 
                          background: '#ffffff',
                          color: '#007bff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          flex: 1
                        }}
                      >
                        👁️ 상세보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        <div style={{ marginTop: '40px' }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
