import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { LostItem, User } from '../types';
import { getAllLostItems } from '../utils/api';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

interface SearchPageProps {
  currentUser?: User | null;
}

const SearchPage: React.FC<SearchPageProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<LostItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await getAllLostItems();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error('분실물 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} />
      
      <div style={{ padding: '16px' }}>
        <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>
          🔍 분실물 검색
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="키워드를 입력하세요 (제목, 설명, 위치, 종류)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            로딩 중...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px', color: '#666' }}>
              검색 결과: {filteredItems.length}개
            </div>
            
            {filteredItems.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#666',
                background: '#f9f9f9',
                borderRadius: '8px'
              }}>
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 분실물이 없습니다.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {filteredItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/detail/${item.id}`}
                    style={{
                      display: 'block',
                      padding: '16px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      textDecoration: 'none',
                      color: '#333'
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
                  </Link>
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

export default SearchPage;
