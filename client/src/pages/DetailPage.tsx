import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import GlobalMonetizationCard from '../components/GlobalMonetizationCard';
import DateFormatter from '../components/DateFormatter';
import { LostItem, Comment, User } from '../types';
import { isMyItem } from '../utils/deviceId';
import './DetailPage.css';

interface DetailPageProps {
  currentUser: User | null;
  onAddComment: (itemId: number, commentText: string) => void;
  onDeleteComment: (itemId: number, commentId: number) => void;
  onDeleteItem: (itemId: number) => void;
  onUpdateItem: (updatedItem: LostItem) => void;
  onMarkAsRead: (itemId: number) => void;
  theme: 'light' | 'dark';
}

const DetailPage: React.FC<DetailPageProps> = ({ currentUser, onAddComment, onDeleteComment, onDeleteItem, onUpdateItem, onMarkAsRead, theme }) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/lost-items/${id}`);
        if (!response.ok) {
          throw new Error(t('detailPage.notFound'));
        }
        const data = await response.json();
        setItem(data.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error.occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const validateComment = (comment: string) => {
    if (!comment.trim()) {
      showToastMessage(t('detailPage.commentValidationEmpty'), 'error');
      return false;
    }
    if (comment.trim().length < 2) {
      showToastMessage(t('detailPage.commentValidationMin'), 'error');
      return false;
    }
    if (comment.trim().length > 500) {
      showToastMessage(t('detailPage.commentValidationMax'), 'error');
      return false;
    }
    return true;
  };

  const handleCommentSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateComment(newComment)) return;
    
    if (!item) {
      showToastMessage(t('detailPage.itemNotFound'), 'error');
      return;
    }

    try {
      onAddComment(item.id, newComment.trim());
      setNewComment('');
      showToastMessage(t('detailPage.commentSuccess'));
    } catch (error) {
      showToastMessage(t('detailPage.commentError'), 'error');
    }
  };

  const handleDeleteItemClick = () => {
    if (!item) return;
    
    if (window.confirm(t('detailPage.deleteConfirm'))) {
      try {
        onDeleteItem(item.id);
        showToastMessage(t('detailPage.itemDeleteSuccess'));
        setTimeout(() => navigate('/list'), 1500);
      } catch (error) {
        showToastMessage(t('detailPage.itemDeleteError'), 'error');
      }
    }
  };

  const handleEditItemClick = () => {
    if (!item) return;
    navigate(`/edit/${item.id}`);
  };

  const handleDeleteComment = (commentId: number) => {
    if (!item) return;
    
    if (window.confirm(t('detailPage.deleteCommentConfirm'))) {
      try {
        onDeleteComment(item.id, commentId);
        showToastMessage(t('detailPage.commentDeleteSuccess'));
      } catch (error) {
        showToastMessage(t('detailPage.commentDeleteError'), 'error');
      }
    }
  };

  const getCommentAuthorName = (authorId: number) => {
    // 실제로는 사용자 정보를 가져와야 하지만, 임시로 ID를 반환
    return `사용자 ${authorId}`;
  };

  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="detail-container">
        <div className="error">
          <h2>{t('error.occurred')}</h2>
          <p>{error || t('detailPage.notFound')}</p>
          <button onClick={() => navigate('/list')}>{t('detailPage.backToList')}</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={item ? `${item.item_type} - ${t('detailPage.title')}` : t('detailPage.title')}
        description={item ? item.description : t('detailPage.title')}
      />
      <div className="detail-container">
        {/* 토스트 메시지 */}
        {showToast && (
        <div className={`toast-message ${toastType}`}>
          {toastMessage}
        </div>
      )}
      
      <div className="item-header">
        <h1>{item.item_type}</h1>
        {currentUser && currentUser.id === item.author_id && (
          <div className="button-group">
            <button onClick={handleEditItemClick} className="edit-item-button">
              {t('detailPage.editItem')}
            </button>
            <button onClick={handleDeleteItemClick} className="delete-item-button">
              {t('detailPage.deleteItem')}
            </button>
          </div>
        )}
      </div>

      <div className="item-content">
        <div className="item-images-container">
          {item.image_urls && item.image_urls.length > 0 ? (
            item.image_urls.map((url: string, index: number) => (
              <img
                key={index}
                src={url}
                alt={`${item.item_type} ${index + 1}`}
                className="item-image"
                onClick={() => setSelectedImage(url)}
              />
            ))
          ) : (
            <div className="no-image">
              <p>{t('detailPage.noImage')}</p>
            </div>
          )}
        </div>

        <div className="item-details">
          <p><strong>{t('detailPage.description')}:</strong> {item.description}</p>
          <p><strong>{t('detailPage.location')}:</strong> {item.location}</p>
          <p><strong>{t('detailPage.registeredDate')}:</strong> {item.created_at ? <DateFormatter date={item.created_at} formatType="short" /> : t('detailPage.noDate')}</p>
        </div>

        {/* 위치 정보 */}
        {item.lat && item.lng ? (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
            marginTop: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              📍 분실 위치
            </h3>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '12px',
            }}>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                {item.place_name || item.location}
              </div>
              {item.address && (
                <div style={{ fontSize: '13px', opacity: 0.9 }}>
                  {item.address}
                </div>
              )}
            </div>

            {/* OpenStreetMap (API 키 불필요, 무료) */}
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}>
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${item.lng-0.01},${item.lat-0.01},${item.lng+0.01},${item.lat+0.01}&layer=mapnik&marker=${item.lat},${item.lng}`}
                style={{ border: 0 }}
                title="위치 지도"
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={`https://map.naver.com/v5/?c=${item.lng},${item.lat},16,0,0,0,dh`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#03C75A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  textAlign: 'center',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                🗺️ 네이버 지도
              </a>
              <a
                href={`https://www.google.com/maps?q=${item.lat},${item.lng}&z=17&hl=ko`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  textAlign: 'center',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                🗺️ Google
              </a>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '30px',
            background: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#666',
            marginTop: '20px',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📍</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>위치 정보가 없습니다</div>
            <div style={{ fontSize: '13px', marginTop: '6px', color: '#999' }}>
              이 분실물은 등록 시 지도 위치를 선택하지 않았습니다
            </div>
          </div>
        )}

        <div className="comments-section">
          <h3>{t('detailPage.comments', { count: (item.comments || []).length })}</h3>
          {(item.comments || []).length === 0 ? (
            <div className="no-comments">
              <p>{t('detailPage.noComments')}</p>
            </div>
          ) : (
            (item.comments || []).map((comment: Comment) => (      
              <div key={comment.id} className={`comment-item ${comment.author_id === item.author_id ? 'author-comment' : ''}`}>
                <div className="comment-content">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <span className={`comment-author ${comment.author_id === item.author_id ? 'author-badge' : ''}`}>
                        {comment.author_name || getCommentAuthorName(comment.author_id)}
                        {comment.author_id === item.author_id && <span className="author-label"> {t('detailPage.authorBadge')}</span>}
                      </span>
                      <span className="comment-time">
                        {comment.created_at ? <DateFormatter date={comment.created_at} formatType="relative" /> : ''}
                      </span>
                    </div>
                    {(currentUser?.id === comment.author_id || currentUser?.id === item.author_id) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="comment-delete-button"
                        title={t('common.delete')}
                      >
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="comment-input-container">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('detailPage.commentPlaceholder')}
                className="comment-input"
                rows={3}
              />
              <button type="submit" className="comment-submit-btn">
                {t('detailPage.commentSubmit')}
              </button>
            </div>
          </form>
        </div>

        {/* 아마존 어소시에이트 수익화 카드 */}
        <GlobalMonetizationCard />
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <img src={selectedImage} alt={t('detailPage.noImage')} />
            <button className="close-button" onClick={() => setSelectedImage(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default DetailPage; 