// pages/SuccessStoriesPage.tsx
// 👉 사용자가 분실물을 찾은 사례들을 보여주는 후기 페이지

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SuccessStoriesPage.css";

interface Story {
  content: string;
  author: string;
}

export default function SuccessStoriesPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [stories, setStories] = useState<Story[]>([
    { content: '"지하철에서 잃어버린 가방을 다시 찾았어요.  댓글 달아주신 분 정말 감사합니다. 이런 앱이 있다니 감동이에요."', author: '– 서울 강동구, 김OO님' },
    { content: '"우리 강아지가 사라졌는데, 근처에 사시는 분이 보고 연락해주셨어요!  바로 찾았습니다. 진심으로 감사합니다."', author: '– 수원, 이OO님' },
    { content: '"학교 앞에서 잃어버린 킥보드를 찾았어요.  다른 학생이 올려주신 글 덕분에 하루 만에 찾았습니다!"', author: '– 부산, 박OO님' },
    { content: '"택배를 놓고 온 줄 알았는데, 착한 분이 보관해주시고  연락해주셨어요. 정말 감동받았습니다."', author: '– 대구, 최OO님' },
    { content: '"지갑을 잃어버렸는데 카드와 현금이 그대로 있었어요.  정말 믿을 수 있는 분들이 많으시네요."', author: '– 인천, 정OO님' },
  ]);
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  const handleOpenWriteModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewContent("");
    setNewAuthor("");
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !newAuthor.trim()) return;
    setStories([{ content: newContent, author: `– ${newAuthor}` }, ...stories]);
    handleCloseModal();
  };

  return (
    <main className="success-stories-container">
      <div className="success-stories-header">
        <button 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← 뒤로가기
        </button>
        <h1 className="page-title">🎉 감동 후기 모음</h1>
        <button className="write-story-btn" onClick={handleOpenWriteModal}>후기 작성</button>
      </div>

      {/* 후기 작성 모달 */}
      {showModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>감동 후기 작성</h2>
            <textarea
              placeholder="감동 후기를 입력해 주세요"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={4}
              style={{ resize: 'none', borderRadius: 8, border: '1px solid #eee', padding: 10, fontSize: 15 }}
              required
            />
            <input
              type="text"
              placeholder="이름 또는 지역 (예: 서울, 김OO님)"
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
              style={{ borderRadius: 8, border: '1px solid #eee', padding: 10, fontSize: 15 }}
              required
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleCloseModal} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>취소</button>
              <button type="submit" style={{ background: '#ffd600', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>등록</button>
            </div>
          </form>
        </div>
      )}

      <div className="stories-list">
        {stories.map((story, idx) => (
          <div className="story-card" key={idx}>
            <p className="story-content">{story.content}</p>
            <p className="story-author">{story.author}</p>
          </div>
        ))}
      </div>

      <div className="footer-section">
        <p className="footer-message">
          여러분의 따뜻한 마음이 누군가에게 큰 도움이 됩니다
        </p>
        <button 
          onClick={() => navigate("/")}
          className="home-button"
        >
          홈으로 돌아가기
        </button>
      </div>
    </main>
  );
} 