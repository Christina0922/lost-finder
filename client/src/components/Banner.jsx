import React from "react";
import { nextCoupangLink } from '../utils/coupang';
import "./Banner.css"; // 배너 전용 스타일

function Banner() {
  const handleCoupangClick = () => {
    const url = nextCoupangLink();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="banner">
      <div className="banner-left">
        {/* 아이콘 제거됨 */}
        <span className="banner-text">
          놓치지 마세요! 분실 방지 용품 인기 상품 모음 👀
        </span>
      </div>
      <button
        onClick={handleCoupangClick}
        className="banner-button"
        style={{
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block'
        }}
      >
        쿠팡에서 보기
      </button>
    </div>
  );
}

export default Banner;
