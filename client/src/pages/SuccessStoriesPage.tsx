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
    <main className="max-w-xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold text-center">📦 감동 후기 모음</h1>
      <p className="text-base text-gray-700 text-center mb-4 font-semibold">
        이곳은 다시 만난 소중한 물건과 따뜻한 이야기들이 모이는 공간입니다.<br />
        당신의 경험이 누군가에게 큰 희망이 될 수 있어요.
      </p>
      <p className="text-sm text-gray-700 text-center mb-4">
        지금까지 총 <strong>{stories.length}</strong>개의 따뜻한 후기가 등록되었습니다.
      </p>

      {/* ✅ 작성 폼 */}
      <div className="bg-gray-100 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">📝 나도 후기 남기기</h2>
        {submitted && (
          <p className="text-green-600 font-medium text-center mb-4">
            감사합니다! 후기가 제출되었습니다.
          </p>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="success-form">
          <textarea
            placeholder="후기 내용을 입력해 주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="success-textarea"
            required
          />
          <input
            type="text"
            placeholder="이름 또는 닉네임"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="success-input"
            required
          />
          <input
            type="text"
            placeholder="지역 (예: 서울 강남구)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="success-input"
            required
          />
          <button
            type="submit"
            className="success-submit-btn"
          >
            후기 남기기
          </button>
        </form>
      </div>

      {/* ✅ 후기 리스트 출력 */}
      <div className="space-y-6">
        {stories.length === 0 ? (
          <>
            <p className="text-center no-story-message">아직 후기가 없습니다. 첫 후기를 남겨보세요!</p>
          </>
        ) : (
          stories.map((story, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl shadow mb-4 space-y-2 border border-gray-100"
            >
              <p className="text-gray-700 font-medium">"{story.content}"</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>– {story.name}, {story.location}</span>
                <button
                  onClick={() => handleLike(idx)}
                  className="text-pink-500 hover:text-pink-700 font-bold flex items-center gap-1"
                  aria-label="공감하기"
                >
                  ❤️ <span>{story.likes || 0}</span>
                </button>
              </div>
              {/* <AdminOnly>
                <button
                  onClick={() => handleDelete(idx)}
                  className="text-red-500 text-xs mt-1 hover:underline"
                >
                  삭제하기
                </button>
              </AdminOnly> */}
            </div>
          ))
        )}
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

      <div className="mt-10 text-center">
        <a
          href="https://3match-game-865e.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-yellow-100 border border-yellow-400 text-yellow-800 text-center font-semibold py-3 rounded-xl shadow hover:scale-105 transition text-lg"
        >
          기다리는 동안, 퍼즐 게임 한 판 어때요?
        </a>
      </div>
    </main>
  );
} 