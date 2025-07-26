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

  // ✅ 로컬스토리지에서 후기 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("successStories");
    if (saved) {
      setStories(JSON.parse(saved));
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
          stories.map((story, idx) => (
            <div
              key={idx}
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
                  onClick={() => handleLike(idx)}
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
          ))
        )}
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '8px', 
        paddingTop: '8px', 
        borderTop: '1px solid #e9ecef',
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
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            color: '#92400e',
            textAlign: 'center',
            fontWeight: '600',
            padding: '8px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none',
            fontSize: 'min(14px, 3.5vw)',
            transition: 'transform 0.2s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          기다리는 동안, 퍼즐 게임 한 판 어때요?
        </a>
      </div>
    </main>
  );
} 