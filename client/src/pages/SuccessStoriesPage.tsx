// pages/SuccessStoriesPage.tsx
// 👉 사용자가 분실물을 찾은 사례들을 보여주는 후기 페이지

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SuccessStoriesPage.css";
// import { useUser } from '../lib/useUser';
import { isAdmin } from "../lib/admin";

interface Story {
  content: string;
  name: string;
  location: string;
  likes: number;
}

export default function SuccessStoriesPage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ 로컬스토리지에서 후기 불러오기
  useEffect(() => {
    // 초기 샘플 데이터
    const sampleStories: Story[] = [
      {
        content: "지갑을 버스에 놓고 내렸는데, 이 사이트 덕분에 다시 찾았어요! 정말 감사합니다.",
        name: "김민수",
        location: "서울 강남구",
        likes: 12
      },
      {
        content: "휴대폰을 카페에 두고 나왔는데 친절한 분이 등록해주셔서 찾았습니다. 너무 감사해요!",
        name: "이지은",
        location: "부산 해운대구",
        likes: 8
      },
      {
        content: "아이가 소중히 여기는 인형을 공원에서 잃어버렸는데 찾을 수 있었어요. 정말 고맙습니다!",
        name: "박서준",
        location: "경기 수원시",
        likes: 15
      },
      {
        content: "열쇠를 지하철역에서 잃어버렸는데 역무원님이 여기에 등록해주셔서 찾았습니다!",
        name: "최유진",
        location: "서울 강동구",
        likes: 5
      },
      {
        content: "노트북을 도서관에 두고 나왔는데 이 사이트로 연락받아서 찾을 수 있었어요!",
        name: "정민호",
        location: "대전 유성구",
        likes: 10
      },
      {
        content: "우산을 버스 정류장에 놓고 왔는데 누군가 등록해주셨어요. 감사합니다!",
        name: "강소희",
        location: "인천 남동구",
        likes: 7
      },
      {
        content: "가방을 택시에 두고 내렸는데 기사님이 바로 연락주셨어요. 정말 고마워요!",
        name: "윤지호",
        location: "서울 마포구",
        likes: 9
      },
      {
        content: "반지를 헬스장 락커에서 잃어버렸는데 찾을 수 있었습니다. 진심으로 감사합니다!",
        name: "한수빈",
        location: "경기 성남시",
        likes: 14
      },
      {
        content: "자전거를 공원에 두고 왔는데 이 사이트 덕분에 다시 찾았어요!",
        name: "송민재",
        location: "부산 수영구",
        likes: 6
      },
      {
        content: "이어폰을 식당에 놓고 나왔는데 직원분이 등록해주셨네요. 너무 감사해요!",
        name: "조은서",
        location: "대구 달서구",
        likes: 11
      },
      {
        content: "카메라를 관광지에서 잃어버렸는데 여기서 찾았어요. 정말 신기하고 감사합니다!",
        name: "김하늘",
        location: "제주 제주시",
        likes: 18
      }
    ];
    
    const saved = localStorage.getItem("successStories");
    if (saved) {
      setStories(JSON.parse(saved));
    } else {
      setStories(sampleStories);
      localStorage.setItem("successStories", JSON.stringify(sampleStories));
    }
  }, []);

  // ✅ 후기 제출 처리
  const handleSubmit = () => {
    if (!content.trim() || !name.trim() || !location.trim()) return;
    const newStory: Story = {
      content,
      name,
      location,
      likes: 0,
    };
    const updated = [newStory, ...stories];
    setStories(updated);
    localStorage.setItem("successStories", JSON.stringify(updated));
    setContent("");
    setName("");
    setLocation("");
    setSubmitted(true);
    setCurrentPage(1); // 새 후기 작성 시 첫 페이지로
    setTimeout(() => setSubmitted(false), 3000); // 3초 후 문구 사라짐
  };

  // ✅ 관리자용 후기 삭제 함수
  const handleDelete = (index: number) => {
    const updated = [...stories];
    updated.splice(index, 1);
    setStories(updated);
    localStorage.setItem("successStories", JSON.stringify(updated));
  };

  const handleLike = (index: number) => {
    const updated = [...stories];
    updated[index].likes = (updated[index].likes || 0) + 1;
    setStories(updated);
    localStorage.setItem("successStories", JSON.stringify(updated));
  };

  // ✅ 페이지네이션 계산
  const totalPages = Math.ceil(stories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStories = stories.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main style={{ 
      maxWidth: 'min(600px, 90vw)', 
      margin: '0 auto', 
      padding: 'min(20px, 3vw) min(16px, 4vw)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'min(20px, 3vw)' 
    }}>
      <h1 style={{ fontSize: 'min(20px, 5vw)', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>📦 감동 후기 모음</h1>
      <p style={{ 
        fontSize: 'min(14px, 3.5vw)', 
        color: '#374151', 
        textAlign: 'center', 
        marginBottom: '8px', 
        fontWeight: '600',
        lineHeight: '1.4'
      }}>
        이곳은 다시 만난 소중한 물건과<br />
        따뜻한 이야기들이 모이는 공간입니다.<br />
        당신의 경험이 누군가에게 큰 희망이 될 수 있어요.
      </p>
      <p style={{ 
        fontSize: 'min(12px, 3vw)', 
        color: '#374151', 
        textAlign: 'center', 
        marginBottom: '12px' 
      }}>
        지금까지 총 <strong>{stories.length}</strong>개의 따뜻한 후기가 등록되었습니다.
      </p>

      {/* ✅ 작성 폼 */}
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: 'min(16px, 4vw)', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ 
          fontSize: 'min(16px, 4vw)', 
          fontWeight: '600', 
          marginBottom: '12px', 
          textAlign: 'center' 
        }}>📝 나도 후기 남기기</h2>
        {submitted && (
          <p style={{ 
            color: '#059669', 
            fontWeight: '500', 
            textAlign: 'center', 
            marginBottom: '12px',
            fontSize: 'min(12px, 3vw)'
          }}>
            감사합니다! 후기가 제출되었습니다.
          </p>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            placeholder="후기 내용을 입력해 주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: 'min(13px, 3.2vw)',
              minHeight: '80px',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            required
          />
          <input
            type="text"
            placeholder="이름 또는 닉네임"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: 'min(13px, 3.2vw)',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            required
          />
          <input
            type="text"
            placeholder="지역 (예: 서울 강남구)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: 'min(13px, 3.2vw)',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            required
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: 'min(14px, 3.5vw)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              boxSizing: 'border-box'
            }}
          >
            후기 남기기
          </button>
        </form>
      </div>

      {/* ✅ 후기 리스트 출력 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stories.length === 0 ? (
          <>
            <p style={{ 
              textAlign: 'center', 
              color: '#222', 
              fontWeight: '700', 
              fontSize: 'min(14px, 3.5vw)', 
              marginBottom: '4px' 
            }}>아직 후기가 없습니다. 첫 후기를 남겨보세요!</p>
          </>
        ) : (
          currentStories.map((story, idx) => {
            const actualIndex = indexOfFirstItem + idx;
            return (
              <div
                key={actualIndex}
                style={{
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  marginBottom: '8px',
                  border: '1px solid #f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <p style={{ color: '#374151', fontWeight: '500', fontSize: 'min(13px, 3.2vw)' }}>"{story.content}"</p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  fontSize: 'min(11px, 2.8vw)', 
                  color: '#6b7280' 
                }}>
                  <span>– {story.name}, {story.location}</span>
                  <button
                    onClick={() => handleLike(actualIndex)}
                    style={{
                      color: '#ec4899',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 'min(11px, 2.8vw)'
                    }}
                    aria-label="공감하기"
                  >
                    ❤️ <span>{story.likes || 0}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ✅ 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === 1 ? '#e5e7eb' : '#007bff',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: 'min(14px, 3.5vw)',
              fontWeight: '600',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            이전
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              style={{
                padding: '8px 12px',
                minWidth: '40px',
                backgroundColor: currentPage === pageNum ? '#007bff' : 'white',
                color: currentPage === pageNum ? 'white' : '#007bff',
                border: '1px solid #007bff',
                borderRadius: '6px',
                fontSize: 'min(14px, 3.5vw)',
                fontWeight: currentPage === pageNum ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#007bff',
              color: currentPage === totalPages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: 'min(14px, 3.5vw)',
              fontWeight: '600',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            다음
          </button>
        </div>
      )}

      <div style={{ 
        textAlign: 'center', 
        marginTop: '8px', 
        paddingTop: '8px', 
        borderTop: '2px solid rgba(102, 126, 234, 0.35)',
        width: '100%'
      }}>
        <p style={{ 
          fontSize: 'min(14px, 3.5vw)', 
          color: '#6c757d', 
          marginBottom: '12px', 
          lineHeight: '1.4' 
        }}>
          여러분의 따뜻한 마음이 누군가에게 큰 도움이 됩니다
        </p>
        <button 
          onClick={() => navigate("/")}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: 'min(8px, 2vw) min(16px, 4vw)',
            borderRadius: '6px',
            fontSize: 'min(14px, 3.5vw)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            boxSizing: 'border-box'
          }}
        >
          홈으로 돌아가기
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center',
        width: '100%'
      }}>
        <a
          href="https://3match-game-865e.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            width: '100%',
            backgroundColor: '#e7f3ff',
            border: '1px solid #007bff',
            color: '#0056b3',
            textAlign: 'center',
            fontWeight: '600',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 123, 255, 0.15)',
            textDecoration: 'none',
            fontSize: 'min(14px, 3.5vw)',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.backgroundColor = '#d0e8ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#e7f3ff';
          }}
        >
          🎮 기다리는 동안, 퍼즐 게임 한 판 어때요?
        </a>
      </div>
    </main>
  );
} 