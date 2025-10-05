import React, { useState, useEffect } from 'react';
import type { LostItem, User } from '../types';
import { getAllLostItems } from '../utils/api';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

interface HistoryPageProps {
  currentUser?: User | null;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ currentUser }) => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await getAllLostItems();
        // 현재 사용자가 등록한 분실물만 필터링
        const userItems = data.filter((item: LostItem) => 
          item.author_id === currentUser?.id || 
          item.author_id === currentUser?.email
        );
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
