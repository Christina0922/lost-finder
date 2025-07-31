import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KakaoMapComponent from '../components/KakaoMapComponent';
import { LostItem, Comment, User } from '../App';
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
          throw new Error('분실물을 찾을 수 없습니다.');
        }
        const data = await response.json();
        setItem(data.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
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
      showToastMessage('댓글 내용을 입력해주세요.', 'error');
      return false;
    }
    if (comment.trim().length < 2) {
      showToastMessage('댓글은 최소 2자 이상 입력해주세요.', 'error');
      return false;
    }
    if (comment.trim().length > 500) {
      showToastMessage('댓글은 최대 500자까지 입력 가능합니다.', 'error');
      return false;
    }
    return true;
  };

  const handleCommentSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateComment(newComment)) return;
    
    if (!item) {
      showToastMessage('분실물 정보를 찾을 수 없습니다.', 'error');
      return;
    }

    try {
      onAddComment(item.id, newComment.trim());
      setNewComment('');
      showToastMessage('댓글이 성공적으로 등록되었습니다!');
    } catch (error) {
      showToastMessage('댓글 등록에 실패했습니다.', 'error');
    }
  };

  const handleDeleteItemClick = () => {
    if (!item) return;
    
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      try {
        onDeleteItem(item.id);
        showToastMessage('게시물이 성공적으로 삭제되었습니다.');
        setTimeout(() => navigate('/list'), 1500);
      } catch (error) {
        showToastMessage('게시물 삭제에 실패했습니다.', 'error');
      }
    }
  };

  const handleEditItemClick = () => {
    if (!item) return;
    navigate(`/edit/${item.id}`);
  };

  const handleDeleteComment = (commentId: number) => {
    if (!item) return;
    
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        onDeleteComment(item.id, commentId);
        showToastMessage('댓글이 성공적으로 삭제되었습니다.');
      } catch (error) {
        showToastMessage('댓글 삭제에 실패했습니다.', 'error');
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
          <h2>오류</h2>
          <p>{error || '분실물을 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate('/list')}>목록으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
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
              게시물 수정
            </button>
            <button onClick={handleDeleteItemClick} className="delete-item-button">
              게시물 삭제
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
              <p>이미지가 없습니다</p>
            </div>
          )}
        </div>

        <div className="item-details">
          <p><strong>설명:</strong> {item.description}</p>
          <p><strong>위치:</strong> {item.location}</p>
          <p><strong>등록일:</strong> {item.created_at ? new Date(item.created_at).toLocaleDateString() : '날짜 없음'}</p>
        </div>

        <div className="map-container">
          <KakaoMapComponent
            location={item.location}
            itemType={item.item_type}
            description={item.description}
          />
        </div>

        <div className="comments-section">
          <h3>댓글 ({(item.comments || []).length}개)</h3>
          {(item.comments || []).length === 0 ? (
            <div className="no-comments">
              <p>아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
            </div>
          ) : (
            (item.comments || []).map((comment: Comment) => (      
              <div key={comment.id} className={`comment-item ${comment.author_id === item.author_id ? 'author-comment' : ''}`}>
                <div className="comment-content">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <span className={`comment-author ${comment.author_id === item.author_id ? 'author-badge' : ''}`}>
                        {comment.author_name || getCommentAuthorName(comment.author_id)}
                        {comment.author_id === item.author_id && <span className="author-label"> (게시자)</span>}
                      </span>
                      <span className="comment-time">
                        {comment.created_at ? new Date(comment.created_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </span>
                    </div>
                    {(currentUser?.id === comment.author_id || currentUser?.id === item.author_id) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="comment-delete-button"
                        title="댓글 삭제"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <div className="comment-input-container">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="정보를 남겨주세요... (최소 2자)"
                  className="comment-input"
                  rows={3}
                />
                <button type="submit" className="comment-submit-btn">
                  댓글 작성
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt">
              <p>댓글을 작성하려면 로그인이 필요합니다.</p>
              <button onClick={() => navigate('/login')}>로그인하기</button>
            </div>
          )}
        </div>
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <img src={selectedImage} alt="확대된 이미지" />
            <button className="close-button" onClick={() => setSelectedImage(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPage; 