import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';
import { API_BASE } from '../utils/api';

interface SuccessStory {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  category?: string | null;
}

interface SuccessStoriesPageProps {
  currentUser?: User | null;
}

const SuccessStoriesPage: React.FC<SuccessStoriesPageProps> = ({ currentUser }) => {
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([
    {
      id: 1,
      title: "지갑을 찾았어요! 🎉",
      author: "김민수",
      date: "2024-01-15",
      content: "지하철에서 지갑을 잃어버렸는데, LostFinder를 통해 3일 만에 찾았습니다. 정말 감사해요!",
      category: "지갑"
    },
    {
      id: 2,
      title: "핸드폰 복구 성공 📱",
      author: "이영희",
      date: "2024-01-10",
      content: "카페에서 핸드폰을 두고 나왔는데, 좋은 분이 등록해주셔서 바로 연락이 왔어요. 세상에 착한 사람이 많네요!",
      category: "핸드폰"
    },
    {
      id: 3,
      title: "가방을 찾았습니다 🎒",
      author: "박철수",
      date: "2024-01-08",
      content: "버스에서 내릴 때 가방을 두고 내렸는데, 운전기사분이 LostFinder에 등록해주셨어요. 정말 고마웠습니다.",
      category: "가방"
    },
    {
      id: 4,
      title: "열쇠를 찾았어요! 🔑",
      author: "최지영",
      date: "2024-01-05",
      content: "공원에서 산책하다가 열쇠를 잃어버렸는데, 다른 분이 발견해서 등록해주셨네요. LostFinder 덕분에 집에 들어갈 수 있었어요!",
      category: "열쇠"
    },
    {
      id: 5,
      title: "신분증 복구 완료 🆔",
      author: "정민호",
      date: "2024-01-03",
      content: "신분증을 잃어버려서 정말 당황했는데, LostFinder를 통해 찾을 수 있었습니다. 정말 감사합니다!",
      category: "신분증"
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 서버에서 성공 사례 목록 가져오기
  useEffect(() => {
    loadStories();
  }, []);

  // 본인이 작성한 성공 사례인지 확인
  const isMyStory = (story: SuccessStory) => {
    if (!currentUser) return false;
    const authorName = currentUser.username || currentUser.name || currentUser.email || '';
    return story.author === authorName || story.author === '익명';
  };

  const handleDelete = async (storyId: number) => {
    if (!window.confirm('정말 삭제하시겠어요? 삭제 후 되돌릴 수 없습니다.')) return;
    
    try {
      setDeletingId(storyId);
      const response = await fetch(`${API_BASE}/api/success-stories/${storyId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSuccessStories(prev => prev.filter(s => s.id !== storyId));
        alert('삭제되었습니다.');
      } else {
        const error = await response.json();
        alert(error.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
      setDeletingId(null);
    }
  };

  const loadStories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/success-stories`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const stories = await response.json();
        if (Array.isArray(stories) && stories.length > 0) {
          setSuccessStories(stories);
        }
      }
    } catch (error) {
      console.error('성공 사례 목록 로드 실패:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const authorName = currentUser?.username || currentUser?.name || currentUser?.email || '익명';
      
      const response = await fetch(`${API_BASE}/api/success-stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category.trim() || null,
          author_name: authorName,
          author_id: currentUser?.id || 1
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.story) {
          setSuccessStories([result.story, ...successStories]);
          setFormData({ title: '', content: '', category: '' });
          setShowModal(false);
          alert('후기가 등록되었습니다!');
        }
      } else {
        const error = await response.json();
        alert(error.message || '후기 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('후기 등록 실패:', error);
      alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} />
      
      <div style={{ padding: '16px' }}>
        <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>
          🏆 성공 사례
        </h2>
        
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginBottom: '24px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          LostFinder를 통해 분실물을 찾은 감동적인 이야기들을 모았습니다.
          <br />
          여러분의 이야기도 들려주세요!
        </p>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {successStories.map((story) => (
            <div
              key={story.id}
              style={{
                padding: '20px',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  color: '#333',
                  flex: 1
                }}>
                  {story.title}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {story.category && (
                    <span style={{
                      background: '#007bff',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {story.category}
                    </span>
                  )}
                  {/* 본인이 작성한 경우에만 삭제 버튼 표시 */}
                  {isMyStory(story) && (
                    <button
                      onClick={() => handleDelete(story.id)}
                      disabled={deletingId === story.id}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        border: '0',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: deletingId === story.id ? 'not-allowed' : 'pointer',
                        opacity: deletingId === story.id ? 0.6 : 1
                      }}
                    >
                      {deletingId === story.id ? '삭제 중...' : '삭제'}
                    </button>
                  )}
                </div>
              </div>
              
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                color: '#555',
                lineHeight: '1.5'
              }}>
                {story.content}
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#888'
              }}>
                <span>작성자: {story.author}</span>
                <span>{story.date}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          marginTop: '32px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>
            💬 여러분의 이야기를 들려주세요!
          </h3>
          <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
            LostFinder를 통해 분실물을 찾은 경험이 있으시다면,
            <br />
            다른 분들에게 희망을 주는 이야기를 공유해주세요.
          </p>
          <button
            style={{
              background: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setShowModal(true)}
          >
            후기 작성하기
          </button>
        </div>
        
        {/* 후기 작성 모달 */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '16px'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>후기 작성하기</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: 지갑을 찾았어요! 🎉"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    내용 *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="분실물을 찾은 경험을 자세히 적어주세요."
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    분실물 종류 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="예: 지갑, 핸드폰, 가방 등"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ title: '', content: '', category: '' });
                    }}
                    style={{
                      padding: '10px 20px',
                      background: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                    style={{
                      padding: '10px 20px',
                      background: isSubmitting || !formData.title.trim() || !formData.content.trim() ? '#9ca3af' : '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: isSubmitting || !formData.title.trim() || !formData.content.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? '등록 중...' : '등록하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '40px' }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesPage;