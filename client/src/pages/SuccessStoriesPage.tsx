// pages/SuccessStoriesPage.tsx
// 👉 사용자가 분실물을 찾은 사례들을 보여주는 후기 페이지

import React from "react";
import { useNavigate } from "react-router-dom";
import "./SuccessStoriesPage.css";

export default function SuccessStoriesPage() {
  const navigate = useNavigate();

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
        <div></div> {/* 빈 div로 균형 맞추기 */}
      </div>

      <div className="stories-list">

        {/* ✅ 후기 1 */}
        <div className="story-card">
          <p className="story-content">
            "지하철에서 잃어버린 가방을 다시 찾았어요.  
            댓글 달아주신 분 정말 감사합니다. 이런 앱이 있다니 감동이에요."
          </p>
          <p className="story-author">– 서울 강동구, 김OO님</p>
        </div>

        {/* ✅ 후기 2 */}
        <div className="story-card">
          <p className="story-content">
            "우리 강아지가 사라졌는데, 근처에 사시는 분이 보고 연락해주셨어요!  
            바로 찾았습니다. 진심으로 감사합니다."
          </p>
          <p className="story-author">– 수원, 이OO님</p>
        </div>

        {/* ✅ 후기 3 */}
        <div className="story-card">
          <p className="story-content">
            "학교 앞에서 잃어버린 킥보드를 찾았어요. 
            다른 학생이 올려주신 글 덕분에 하루 만에 찾았습니다!"
          </p>
          <p className="story-author">– 부산, 박OO님</p>
        </div>

        {/* ✅ 후기 4 */}
        <div className="story-card">
          <p className="story-content">
            "택배를 놓고 온 줄 알았는데, 착한 분이 보관해주시고 
            연락해주셨어요. 정말 감동받았습니다."
          </p>
          <p className="story-author">– 대구, 최OO님</p>
        </div>

        {/* ✅ 후기 5 */}
        <div className="story-card">
          <p className="story-content">
            "지갑을 잃어버렸는데 카드와 현금이 그대로 있었어요. 
            정말 믿을 수 있는 분들이 많으시네요."
          </p>
          <p className="story-author">– 인천, 정OO님</p>
        </div>

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