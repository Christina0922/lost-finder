import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 상품 데이터 타입 정의
interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price: string;
  link: string;
  category: string;
}

// 샘플 상품 데이터 (실제 쿠팡 링크로 교체하세요)
const sampleProducts: Product[] = [
  {
    id: 1,
    title: "🍎 Apple AirTag",
    description: "가방·지갑·자전거, 분실 걱정 끝!",
    image: "https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=AirTag",
    price: "39,000원",
    link: "https://link.coupang.com/a/cCIDpH",
    category: "분실방지"
  },
  {
    id: 2,
    title: "🔑 스마트 키홀더",
    description: "키 찾기, 한 번에! 실시간 위치 추적",
    image: "https://via.placeholder.com/80x80/4ECDC4/FFFFFF?text=Key",
    price: "15,900원",
    link: "https://link.coupang.com/a/cCIDpH",
    category: "분실방지"
  },
  {
    id: 3,
    title: "💼 RFID 방지 지갑",
    description: "카드 정보, 도난 걱정 없이 안전하게!",
    image: "https://via.placeholder.com/80x80/45B7D1/FFFFFF?text=Wallet",
    price: "29,800원",
    link: "https://link.coupang.com/a/cCIDpH",
    category: "보안"
  }
];

export default function BottomBanner() {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  // 5초마다 상품 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % sampleProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentProduct = sampleProducts[currentProductIndex];

  return (
    <div className="w-full bg-gray-100 px-2 py-2 mt-2 mb-4 rounded-2xl shadow-md space-y-2 text-center bottom-banner">
      {/* ✨ 감동 후기 섹션 */}
      <div>
        <p className="text-lg font-semibold bottom-banner-title" style={{ textAlign: 'center', marginBottom: 6, marginTop: 6 }}>
          ✨ 감동 후기 모음
        </p>
        <p className="bottom-banner-desc" style={{ textAlign: 'center', marginBottom: 12 }}>
          "찾으셨나요?"<br />
          한 줄 후기를 남겨주세요.<br />
          누군가에게 큰 힘이 됩니다.
        </p>
        <Link to="/success-stories">
          <button className="mt-2 px-5 py-2 text-white font-bold rounded-lg" style={{
            background: 'linear-gradient(45deg, #ff6b9d, #e91e63)',
            border: 'none',
            borderRadius: '20px',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: '10px 24px',
            boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            감동 후기 보러가기
          </button>
        </Link>
        {/* 후기/게임 구분선 */}
        <hr style={{ border: '0', borderTop: '2px solid #bbb', margin: '12px 0 8px 0', width: '100%' }} />
      </div>

      {/* 퍼즐 게임 안내 */}
      <div>
        <p className="text-lg font-semibold" style={{ textAlign: 'center', marginBottom: 6 }}></p>
        <p className="text-gray-600" style={{ fontSize: "0.95rem", marginBottom: 6, color: "#555", lineHeight: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          기다리는 동안, 잠시 머리를 식힐 수 있는<br />퍼즐 게임 한 판 어때요? 🧩
        </p>
        <a
          href="https://3match-game-865e.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          title="외부 사이트로 이동합니다"
        >
          <button className="mt-1 px-4 py-2 text-white font-bold rounded-lg" style={{
            background: 'linear-gradient(45deg, #ff6b9d, #e91e63)',
            border: 'none',
            borderRadius: '20px',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: '10px 24px',
            boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            퍼즐 맞추러 가기
          </button>
        </a>
      </div>

      {/* 게임/상품 구분선 */}
      <hr style={{ border: '0', borderTop: '2px solid #bbb', margin: '10px 0 12px 0', width: '100%' }} />

      {/* 🛍️ 추천 상품 섹션 - 자동 전환 */}
      <div className="relative">
        <p className="text-lg font-semibold text-center mb-1">
          🛍️ 추천 상품
        </p>
        <p className="text-sm text-gray-600 text-center mb-1">
          분실물 걱정 줄이는 인기템 모아봤어요!
        </p>
        {/* 상품 광고 카드 */}
        <div className="mt-1 p-2 bg-yellow-100 border-2 border-yellow-400 rounded-xl text-base leading-relaxed shadow-md mx-auto" style={{maxWidth:'340px',margin:'0 auto'}}>
          <div
            className="text-blue-700 font-bold text-center"
            style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '14px' }}
            dangerouslySetInnerHTML={{
              __html: currentProduct.description.replace(/<[^>]*>/g, '')
            }}
          />
          <br />
          <a
            href={currentProduct.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2"
            title="외부 사이트로 이동합니다"
          >
            <span className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg text-sm hover:bg-purple-700 transition-colors duration-200 shadow-lg" style={{ display: 'inline-block', marginBottom: '8px' }}>
              지금 쿠팡에서 확인하기
            </span>
          </a>
        </div>
        {/* 상품 인디케이터 제거 - 현재는 슬라이드 기능이 없으므로 사용자 혼란 방지 */}
      </div>
    </div>
  );
}
