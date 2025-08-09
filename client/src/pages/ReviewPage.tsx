import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

interface ReviewPageProps {
  currentUser: User | null;
}

const ReviewPage: React.FC<ReviewPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: '김철수',
      content: 'LostFinder 덕분에 지갑을 찾았습니다! 정말 감사해요.',
      rating: 5,
      date: '2024-01-15'
    },
    {
      id: 2,
      author: '이영희',
      content: '사용하기 쉽고 직관적인 인터페이스가 좋았습니다.',
      rating: 4,
      date: '2024-01-14'
    },
    {
      id: 3,
      author: '박민수',
      content: '빠른 응답과 정확한 위치 정보로 분실물을 찾을 수 있었어요.',
      rating: 5,
      date: '2024-01-13'
    }
  ]);

  const [newReview, setNewReview] = useState({
    content: '',
    rating: 5
  });

  const handleSubmitReview = () => {
    if (!newReview.content.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    const review = {
      id: reviews.length + 1,
      author: currentUser ? currentUser.username : '익명',
      content: newReview.content,
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews([review, ...reviews]);
    setNewReview({ content: '', rating: 5 });
    alert('후기가 등록되었습니다!');
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              marginRight: '12px', 
              padding: '8px 12px', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              cursor: 'pointer' 
            }}
          >
            ← 뒤로
          </button>
          <h1 style={{ margin: 0 }}>후기</h1>
        </div>

        {/* 후기 작성 폼 */}
        {currentUser && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h3>후기 작성</h3>
            <div style={{ marginBottom: '12px' }}>
              <label>평점: </label>
              <select 
                value={newReview.rating} 
                onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                style={{ marginLeft: '8px', padding: '4px' }}
              >
                <option value={5}>5점</option>
                <option value={4}>4점</option>
                <option value={3}>3점</option>
                <option value={2}>2점</option>
                <option value={1}>1점</option>
              </select>
              <span style={{ marginLeft: '8px' }}>{renderStars(newReview.rating)}</span>
            </div>
            <textarea
              value={newReview.content}
              onChange={(e) => setNewReview({...newReview, content: e.target.value})}
              placeholder="분실물 찾기 경험에 대한 후기를 남겨주세요..."
              style={{
                width: '100%',
                height: '100px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '12px'
              }}
            />
            <button 
              onClick={handleSubmitReview}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              후기 등록
            </button>
          </div>
        )}

        {/* 후기 목록 */}
        <div>
          <h3>사용자 후기 ({reviews.length}개)</h3>
          {reviews.map(review => (
            <div key={review.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>{review.author}</strong>
                <span style={{ color: '#666', fontSize: '14px' }}>{review.date}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                {renderStars(review.rating)}
              </div>
              <p style={{ margin: 0, lineHeight: '1.5' }}>{review.content}</p>
            </div>
          ))}
        </div>

        {!currentUser && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p>후기를 작성하려면 로그인이 필요합니다.</p>
            <button 
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              로그인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
