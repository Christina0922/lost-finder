import React, { useEffect, useRef, useState } from "react";

type CoupangBannerProps = {
  coupangLinks: string[]; // 쿠팡 파트너스 링크 배열
};

export default function CoupangBanner({ coupangLinks }: CoupangBannerProps) {
  const [idx, setIdx] = useState(0);
  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  // 새로고침해도 이어서 번갈아가도록 인덱스 복원
  useEffect(() => {
    const saved = Number(localStorage.getItem("coupangIdx") || "0");
    setIdx(Number.isFinite(saved) ? saved % Math.max(coupangLinks.length, 1) : 0);
  }, [coupangLinks.length]);

  const handleClick = () => {
    if (!coupangLinks.length) return;

    const currentUrl = coupangLinks[idx % coupangLinks.length];
    
    // 새 창에서 쿠팡 링크 열기
    window.open(currentUrl, "_blank", "noopener,noreferrer");

    // 다음 링크로 순환
    const nextIdx = (idx + 1) % coupangLinks.length;
    setIdx(nextIdx);
    localStorage.setItem("coupangIdx", String(nextIdx));
  };

  return (
    <div className="ad-banner">
      <div className="ad-content">
        <div className="ad-icon">🔍</div>
        <div className="ad-text">
          <h4>👀 분실 방지 용품 인기 상품 모음</h4>
          <p>AirTag, 가방 위치 추적기, 열쇠고리형 블루투스 위치기기</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="ad-button"
          style={{ color: "#111" }}
          title="쿠팡에서 보기"
        >
          쿠팡에서 보기
        </button>
      </div>

      {/* 실제로 링크를 여는 숨은 앵커 */}
      <a
        ref={anchorRef}
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}
        aria-hidden="true"
      />
    </div>
  );
} 