import React from "react";
import { useNavigate } from "react-router-dom";

export default function BottomBanner() {
  const navigate = useNavigate();

  const handleSuccessStoriesClick = () => {
    navigate("/success-stories");
  };

  return (
    <div className="bottom-banner">

      {/* ✨ 감동 후기 섹션 */}
      <div>
        <h3>✨ 감동 후기 모음</h3>
        <p>분실물을 다시 찾은 따뜻한 이야기들</p>
        <p className="success-story">이웃의 따뜻한 마음이 모여 만든 기적의 순간들</p>
        <button 
          onClick={handleSuccessStoriesClick}
          className="success-stories-btn"
        >
          후기 보러가기
        </button>
      </div>

      {/* 🔻 구분선 */}
      <div className="divider" />

      {/* 🎮 게임 유도 섹션 */}
      <div>
        <h3>🎮 기다리는 동안 한 판 어떠세요?</h3>
        <p>우리 엄마가 좋아하는 3매치 퍼즐 게임</p>
        <p className="game-story">누군가를 기다리는 동안, 마음을 가볍게 해줄 게임이에요</p>
        <a
          href="https://3match-game-865e.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="game-btn">
            퍼즐 맞추러 가기
          </button>
        </a>
      </div>

    </div>
  );
} 