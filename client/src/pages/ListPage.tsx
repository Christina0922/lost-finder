import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import type { LostItem, User } from '../types';
import { getAllLostItems } from '../utils/api';
import LazyImage from '../components/LazyImage';
import { formatBlurredLocation } from '../utils/locationBlur';
import { isMyItem } from '../utils/deviceId';
import './ListPage.css';

// ListPage가 받을 props의 타입을 정의합니다.
interface ListPageProps {
  currentUser: User | null;
  onDeleteItem: (itemId: number) => void;
  theme: 'light' | 'dark';
}

const ITEMS_PER_PAGE = 12; // 페이지당 12개 게시물 (그리드 레이아웃에 최적화)

const ListPage = ({ currentUser, onDeleteItem, theme }: ListPageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

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
        setError(t('listPage.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, [t]);

  // 최신 등록순으로 정렬
  const sortedItems = useMemo(() => {
    if (!Array.isArray(lostItems)) {
      return [];
    }
    return [...lostItems].sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateB - dateA;
    });
  }, [lostItems]);

  // 현재 페이지에 표시할 아이템들 (무한 스크롤용)
  const displayedItems = useMemo(() => {
    return sortedItems.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  const hasMorePages = currentPage < totalPages;

  // Intersection Observer를 사용한 무한 스크롤
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePages) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 300);
    }
  }, [isLoadingMore, hasMorePages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePages && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMorePages, isLoadingMore, loadMore]);

  const handleDeleteClick = (itemId: number) => {
    if (window.confirm(t('detailPage.deleteConfirm'))) {
      onDeleteItem(itemId);
      // 삭제 후 목록에서 제거
      setLostItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleEditClick = (itemId: number) => {
    navigate(`/edit/${itemId}`);
  };

  // 상태 태그 결정 (분실/습득)
  const getStatusTag = (item: LostItem) => {
    // 실제로는 item에 status 필드가 있어야 하지만, 임시로 분실로 표시
    return '분실';
  };

  if (loading) {
    return (
      <div className="list-page-container">
        <div className="loading-state">
          <div className="skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>{t('listPage.retry')}</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={t('listPage.title')}
        description={t('listPage.title')}
      />
      <div className="list-page-container">
        <div className="list-header">
          <h1>{t('listPage.title')}</h1>
        <div className="list-stats">
          <span>{t('listPage.totalItems', { count: sortedItems.length })}</span>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="empty-state">
          <p>{t('listPage.empty')}</p>
          <Link to="/edit/new" className="register-link">{t('listPage.registerFirst')}</Link>
        </div>
      ) : (
        <>
          {/* 카드형 그리드 레이아웃 (Pinterest 스타일) */}
          <div className="card-grid-container">
            {displayedItems.map((item: LostItem) => {
              const isMyPost = currentUser?.id === item.author_id || isMyItem(item.created_by_device_id);
              return (
              <div 
                key={item.id} 
                className={`card-item ${isMyPost ? 'my-item' : ''}`}
              >
                {/* 본인 등록 아이템 강조 표시 */}
                {isMyPost && (
                  <div className="my-item-badge">{t('listPage.myItem')}</div>
                )}
                
                {/* 상태 태그 */}
                <div className="status-tag">
                  {getStatusTag(item)}
                </div>
                
                {/* 이미지 (가장 크게 강조) */}
                <Link to={`/detail/${item.id}`} className="card-image-link">
                  {item.image_urls && item.image_urls.length > 0 && item.image_urls[0] ? (
                    <>
                      <LazyImage 
                        src={item.image_urls[0]} 
                        alt={item.item_type} 
                        className="card-image"
                        placeholder="https://via.placeholder.com/400x300?text=Loading..."
                      />
                      {item.image_urls.length > 1 && (
                        <span className="image-count-badge">
                          +{item.image_urls.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="card-image-placeholder">
                      <div className="placeholder-icon">📷</div>
                      <div className="placeholder-text">사진 없음</div>
                    </div>
                  )}
                </Link>
                
                {/* 카드 내용 */}
                <div className="card-content">
                  <h3 className="card-title">{item.item_type}</h3>
                  <p className="card-location">
                    {formatBlurredLocation(item.location, t)}
                  </p>
                  
                  {isMyPost && (
                    <div className="card-actions">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditClick(item.id);
                        }} 
                        className="card-edit-button"
                      >
                        ✏️ {t('common.edit') || '수정'}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(item.id);
                        }} 
                        className="card-delete-button"
                      >
                        🗑️ {t('common.delete') || '삭제'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>

          {/* 무한 스크롤 트리거 */}
          {hasMorePages && (
            <div ref={observerTarget} className="infinite-scroll-trigger">
              {isLoadingMore && (
                <div className="loading-more">
                  <div className="spinner"></div>
                  <p>{t('common.loading')}</p>
                </div>
              )}
            </div>
          )}

          {/* 모든 아이템 로드 완료 */}
          {!hasMorePages && displayedItems.length > 0 && (
            <div className="load-complete">
              <p>{t('listPage.allItemsLoaded', { count: sortedItems.length })}</p>
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
}

export default ListPage;
