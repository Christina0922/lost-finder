import React from "react";
import { nextCoupangLink } from '../utils/coupang';

/**
 * 쿠팡 링크 5개 정의
 */
const coupangTitles = [
  "🔒 레오바니 자물쇠",
  "🚨 뇌울림 3.0 PRO 도난방지 경보기",
  "📍 갤럭시 스마트태그2 위치추적", 
  "🍏 Apple 에어태그",
  "🧷 스프링 고리형 스트랩 (5개)",
];

/**
 * 쿠팡 배너 컴포넌트
 */
export default function CoupangBanner() {
  const handleCoupangClick = () => {
    const url = nextCoupangLink();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 현재 시각 기준으로 제목 인덱스를 계산
  const selectedTitle = React.useMemo(() => {
    const hourIndex = Math.floor(Date.now() / (1000 * 60 * 60)); // 현재 시각(시 단위)
    const idx = hourIndex % coupangTitles.length; // 5개 순환
    return coupangTitles[idx];
  }, []);

  return (
    <div
      style={{
        margin: "20px auto",
        textAlign: "center",
        backgroundColor: "#f9fafb",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        width: "90%",
        maxWidth: "480px",
      }}
    >
      <button
        onClick={handleCoupangClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: "1.1rem",
          color: "#0074E9",
          fontWeight: 600,
          textDecoration: "none",
          lineHeight: "1.5",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px 16px",
          borderRadius: "8px",
          transition: "background-color 0.2s",
          textAlign: "center",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f0f8ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span>{selectedTitle}</span>
        <span style={{ fontSize: "0.9rem", color: "#666" }}>쿠팡으로 이동하기</span>
      </button>
    </div>
  );
}
