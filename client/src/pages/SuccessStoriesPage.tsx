// pages/SuccessStoriesPage.tsx
// 👉 사용자가 분실물을 찾은 사례들을 보여주는 후기 페이지

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SuccessStoriesPage.css";

interface Story {
  name: string;
  location: string;
  content: string;
}

export default function SuccessStoriesPage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ✅ 로컬스토리지에서 후기 불러오기
  useEffect(() => {
    const stored = localStorage.getItem("successStories");
    if (stored) {
      setStories(JSON.parse(stored));
    }
  }, []);

  // ✅ 후기 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStory: Story = {
      name,
      location,
      content,
    };

    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);
    localStorage.setItem("successStories", JSON.stringify(updatedStories));

    setName("");
    setLocation("");
    setContent("");
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 3000); // 3초 후 문구 사라짐
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold text-center">🎉 감동 후기 모음</h1>

      {/* ✅ 작성 폼 */}
      <div className="bg-gray-100 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">📝 나도 후기 남기기</h2>
        {submitted && (
          <p className="text-green-600 font-medium text-center mb-4">
            감사합니다! 후기가 제출되었습니다.
          </p>
        )}
        <form onSubmit={handleSubmit} className="success-form">
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
          <textarea
            placeholder="후기 내용을 입력해 주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="success-textarea"
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
          stories.map((story, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-md"
            >
              <p className="text-sm text-gray-700 whitespace-pre-line">“{story.content}”</p>
              <p className="text-xs text-gray-400 text-right mt-2">
                – {story.location}, {story.name}
              </p>
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
    </main>
  );
} 