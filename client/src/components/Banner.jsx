import React from "react";
import "./Banner.css"; // 배너 전용 스타일

function Banner() {
  return (
    <div className="banner">
      <div className="banner-left">
        {/* 아이콘 제거됨 */}
        <span className="banner-text">
          놓치지 마세요! 분실 방지 용품 인기 상품 모음 👀
        </span>
      </div>
      <a
        href="https://link.coupang.com/a/상품링크"
        target="_blank"
        rel="noopener noreferrer"
        className="banner-button"
      >
        쿠팡에서 보기
      </a>
    </div>
  );
}

export default Banner;
