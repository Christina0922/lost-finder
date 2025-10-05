// C:\LostFinderProject\client\src\pages\ReviewPage.tsx
import React, { useState } from 'react';
import type { User } from '../types';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

interface Review {
  id: number;
  author: string;
  content: string;
  rating: number;
  date: string;
}

interface Props {
  currentUser?: User | null;
}

const ReviewPage: React.FC<Props> = ({ currentUser }) => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      author: "김민수",
      content: "LostFinder 덕분에 지갑을 찾았습니다! 정말 감사해요. 빠르고 정확한 서비스였어요.",
      rating: 5,
      date: "2024-01-15"
    },
    {
      id: 2,
      author: "이영희",
      content: "핸드폰을 잃어버렸을 때 정말 절망적이었는데, 이 앱을 통해 찾을 수 있었어요. 강력 추천합니다!",
      rating: 5,
      date: "2024-01-10"
    },
    {
      id: 3,
      author: "박철수",
      content: "사용하기 쉽고 직관적이에요. 분실물을 등록하고 찾는 과정이 매우 간편했습니다.",
      rating: 4,
      date: "2024-01-08"
    }
  ]);
  
  const [newReview, setNewReview] = useState<{ content: string; rating: number }>({ content: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.content.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    // 실제로는 서버에 전송하지만, 여기서는 시뮬레이션
    setTimeout(() => {
      const authorName = currentUser?.username || currentUser?.name || currentUser?.email || '익명';
      
      const review: Review = {
        id: reviews.length + 1,
        author: authorName,
        content: newReview.content.trim(),
        rating: newReview.rating,
        date: new Date().toISOString().split('T')[0],
      };

      setReviews([review, ...reviews]);
      setNewReview({ content: '', rating: 5 });
      setIsSubmitting(false);
      alert('후기가 등록되었습니다!');
    }, 500);
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} />
      
      <div style={{ padding: '16px 16px 24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', textAlign: 'center' }}>
          ⭐ 리뷰 & 후기
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          textAlign: 'center', 
          margin: '0 0 24px 0',
          fontSize: 14
        }}>
          LostFinder 사용 후기를 남겨주세요
        </p>

        {/* 후기 작성 폼 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
            ✍️ 후기 작성하기
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#374151', 
                fontWeight: 500,
                fontSize: 14
              }}>
                평점
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 24,
                      cursor: 'pointer',
                      color: star <= newReview.rating ? '#fbbf24' : '#d1d5db',
                      padding: 4,
                      borderRadius: 4
                    }}
                  >
                    {star <= newReview.rating ? '⭐' : '☆'}
                  </button>
                ))}
                <span style={{ color: '#6b7280', fontSize: 14 }}>
                  ({newReview.rating}점)
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#374151', 
                fontWeight: 500,
                fontSize: 14
              }}>
                후기 내용
              </label>
              <textarea
                placeholder="LostFinder 사용 경험을 자유롭게 작성해주세요..."
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                required
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 12,
                  border: '2px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newReview.content.trim()}
              style={{
                width: '100%',
                background: isSubmitting || !newReview.content.trim() ? '#9ca3af' : '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: isSubmitting || !newReview.content.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSubmitting ? '등록 중...' : '후기 등록하기'}
            </button>
          </form>
        </div>

        {/* 기존 후기 목록 */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
            📝 사용자 후기 ({reviews.length}개)
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#6b7280',
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <p>아직 등록된 후기가 없습니다.</p>
            <p>첫 번째 후기를 작성해보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 12
                }}>
                  <div>
                    <h4 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: 16, 
                      color: '#1e293b'
                    }}>
                      👤 {review.author}
                    </h4>
                    <div style={{ fontSize: 14, color: '#6b7280' }}>
                      {renderStars(review.rating)} ({review.rating}점)
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12,
                    color: '#9ca3af'
                  }}>
                    📅 {review.date}
                  </span>
                </div>
                
                <p style={{ 
                  margin: 0, 
                  fontSize: 14, 
                  color: '#4b5563',
                  lineHeight: 1.6
                }}>
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 쿠팡 배너 */}
        <div style={{ marginTop: 40 }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
