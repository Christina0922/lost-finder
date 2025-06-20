import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LostItem, User } from '../App';
import './DetailPage.css';

// DetailPage가 받을 props 타입을 정의합니다.
interface DetailPageProps {
  items: LostItem[];
  users: User[];
  currentUser: User | null;
  onAddComment: (itemId: number, commentText: string) => void;
  onDeleteComment: (itemId: number, commentId: number) => void;
  onMarkAsRead: (itemId: number) => void;
  onDeleteItem: (itemId: number) => void;
}

const badWords = ['바보', '멍청이', '쓰레기']; // 임시 비속어 필터

const DetailPage: React.FC<DetailPageProps> = ({ items, users, currentUser, onAddComment, onDeleteComment, onMarkAsRead, onDeleteItem }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = items.find(i => i.id === Number(id));
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      onMarkAsRead(item.id);
    }
  }, [item, onMarkAsRead]);

  const handleCommentSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (newComment.trim() === '' || !currentUser) {
      if (!currentUser) alert('로그인 후 댓글을 작성할 수 있습니다.');
      return;
    }
    if (badWords.some(word => newComment.includes(word))) {
      alert('부적절한 단어가 포함된 댓글은 등록할 수 없습니다.');
      return;
    }
    if (item) {
      onAddComment(item.id, newComment);
      setNewComment('');
    }
  };

  const handleDeleteItemClick = () => {
    if (item && window.confirm('이 게시물을 정말 삭제하시겠습니까?')) {
      onDeleteItem(item.id);
      navigate('/list');
    }
  };

  const getCommentAuthorEmail = (authorId: number) => {
    const author = users.find(u => u.id === authorId);
    return author ? author.email.split('@')[0] : '알 수 없음';
  };

  if (!item) {
    return <div>해당 분실물을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="detail-container">
      <div className="item-header">
        <h1>{item.itemType}</h1>
        {currentUser && currentUser.id === item.authorId && (
          <button onClick={handleDeleteItemClick} className="delete-item-button">
            게시물 삭제
          </button>
        )}
      </div>

      <div className="item-content">
        <div className="item-images-container">
          {item.imageUrls && item.imageUrls.length > 0 ? (
            item.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${item.itemType} ${index + 1}`}
                className="item-image"
                onClick={() => setSelectedImage(url)}
              />
            ))
          ) : (
            <div className="no-image-placeholder">
              <p>이미지 없음</p>
            </div>
          )}
        </div>
        <div className="item-info">
          <p><strong>상세 설명:</strong> {item.description}</p>
          <p><strong>분실 장소:</strong> {item.location}</p>
        </div>
      </div>

      <hr />

      <div className="comments-section">
        <h3>댓글</h3>
        {item.comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <p><strong>{getCommentAuthorEmail(comment.authorId)}:</strong> {comment.text}</p>
            {(currentUser?.id === comment.authorId || currentUser?.id === item.authorId) && (
              <button onClick={() => onDeleteComment(item.id, comment.id)} className="comment-delete-button">
                삭제
              </button>
            )}
          </div>
        ))}
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={currentUser ? "정보를 남겨주세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
              rows={3}
              disabled={!currentUser}
            />
            <button type="submit" disabled={!currentUser}>댓글 등록</button>
          </form>
        ) : (
          <p>로그인 후 댓글을 작성할 수 있습니다.</p>
        )}
      </div>

      <div className="page-actions">
        <a href="/list" className="button-secondary">목록으로</a>
      </div>

      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <span className="close-modal-button">&times;</span>
          <img src={selectedImage} alt="확대 이미지" className="image-modal-content" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default DetailPage; 