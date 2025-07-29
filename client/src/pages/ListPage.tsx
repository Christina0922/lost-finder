import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LostItem, User } from '../App';
import { getAllLostItems } from '../utils/api';
import LazyImage from '../components/LazyImage';
import './ListPage.css';

// ListPage가 받을 props의 타입을 정의합니다.
interface ListPageProps {
  currentUser: User | null;
  onDeleteItem: (itemId: number) => void;
  theme: 'light' | 'dark';
}

const ITEMS_PER_PAGE = 10; // 페이지당 10개 게시물

const ListPage = ({ currentUser, onDeleteItem, theme }: ListPageProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 서버에서 분실물 목록 가져오기
  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        setLoading(true);
        const items = await getAllLostItems();
        setLostItems(items);
        setError(null);
      } catch (err) {
        console.error('분실물 목록 조회 실패:', err);
        setError('분실물 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, []);

  // 최신 등록순으로 정렬
  const sortedItems = useMemo(() => {
    return [...lostItems].sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateB - dateA;
    });
  }, [lostItems]);

  // 현재 페이지에 표시할 아이템들
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  const hasMorePages = currentPage < totalPages;

  const handleDeleteClick = (itemId: number) => {
    if (window.confirm('이 게시물을 정말 삭제하시겠습니까?')) {
      onDeleteItem(itemId);
      // 삭제 후 목록에서 제거
      setLostItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleEditClick = (itemId: number) => {
    navigate(`/edit/${itemId}`);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleResetPagination = () => {
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="list-page-container">
        <div className="loading-state">
          <p>분실물 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="list-page-container">
      <div className="list-header">
        <h1>분실물 목록</h1>
        <div className="list-stats">
          <span>전체 {sortedItems.length}개</span>
          {currentPage > 1 && (
            <span> • {currentPage}페이지 / {totalPages}페이지</span>
          )}
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="empty-state">
          <p>등록된 분실물이 없습니다.</p>
          <Link to="/edit/new" className="register-link">첫 번째 분실물 등록하기</Link>
        </div>
      ) : (
        <>
          <div className="list-container">
            {currentItems.map((item: LostItem) => (
              <div key={item.id} className={`list-item ${currentUser?.id === item.author_id ? 'my-item' : ''}`}>
                {/* 본인 등록 아이템 강조 표시 */}
                {currentUser?.id === item.author_id && (
                  <div className="my-item-badge">⭐️ 내 등록</div>
                )}
                
                <Link to={`/detail/${item.id}`} className="list-item-image-link">
                  <LazyImage 
                    src={(item.image_urls && item.image_urls[0]) || 'https://via.placeholder.com/200x150'} 
                    alt={item.item_type} 
                    className="list-item-image"
                    placeholder="https://via.placeholder.com/200x150?text=로딩중..."
                  />
                  {item.image_urls && item.image_urls.length > 1 && (
                    <span className="image-count-badge">
                      +{item.image_urls.length - 1}
                    </span>
                  )}
                </Link>
                
                <div className="list-item-content">
                  <h2>{item.item_type}</h2>
                  <p><strong>분실 장소:</strong> {item.location}</p>
                  <Link to={`/detail/${item.id}`} className="detail-button">
                    상세보기 및 댓글
                  </Link>
                  
                  {currentUser && currentUser.id === item.author_id && (
                    <div className="item-actions">
                      <button onClick={() => handleEditClick(item.id)} className="edit-button">
                        수정
                      </button>
                      <button onClick={() => handleDeleteClick(item.id)} className="delete-button">
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {hasMorePages && (
            <div className="pagination-container">
              <button 
                onClick={handleLoadMore} 
                className="load-more-button"
                disabled={!hasMorePages}
              >
                더 보기 ({currentPage * ITEMS_PER_PAGE} / {sortedItems.length})
              </button>
            </div>
          )}

          {/* 페이지 정보 */}
          {currentPage > 1 && (
            <div className="page-info">
              <button onClick={handleResetPagination} className="reset-button">
                처음으로 돌아가기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ListPage; 