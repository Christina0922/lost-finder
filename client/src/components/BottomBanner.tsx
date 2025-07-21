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
    <div className="w-full bg-gray-100 px-2 py-3 mt-4 rounded-2xl shadow-md space-y-4 text-center bottom-banner">
      {/* ✨ 감동 후기 섹션 */}
      <div>
        <p className="text-lg font-semibold bottom-banner-title" style={{ textAlign: 'center', marginBottom: 8, marginTop: 0 }}>
          ✨ 감동 후기 모음
        </p>
        <p className="bottom-banner-desc" style={{ textAlign: 'center', marginBottom: 16 }}>
          “찾으셨나요?”<br />
          한 줄 후기를 남겨주세요.<br />
          누군가에게 큰 힘이 됩니다.
        </p>
        <Link to="/success-stories">
          <button className="mt-3 px-5 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400">
            감동 후기 보러가기
          </button>
        </Link>
        {/* 감동 후기 안내 메시지 */}
        <div className="important-message mt-4 mb-2 text-black font-bold text-base text-center" style={{textAlign:'center', margin:'8px 0'}}>
          "찾았다면, 한 줄만 남겨주세요."<br />
          기적 같은 이야기, 누군가에게 큰 힘이 됩니다.
        </div>
        {/* 후기/게임 구분선 */}
        <hr style={{ border: '0', borderTop: '2.5px solid #bbb', margin: '18px 0 10px 0', width: '100%' }} />
      </div>

      {/* 퍼즐 게임 안내 */}
      <div>
        <p className="text-lg font-semibold" style={{ textAlign: 'center', marginBottom: 6 }}></p>
        <p className="text-gray-600" style={{ fontSize: "0.97rem", marginBottom: 10, color: "#555", lineHeight: 1.5 }}>
          기다리는 동안, 잠시 머리를 식힐 수 있는<br />퍼즐 게임 한 판 어때요?
        </p>
        <a
          href="https://3match-game-865e.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="mt-2 px-4 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-400">
            퍼즐 맞추러 가기
          </button>
        </a>
      </div>

      {/* 게임/상품 구분선 */}
      <hr style={{ border: '0', borderTop: '2.5px solid #bbb', margin: '14px 0 8px 0', width: '100%' }} />

      {/* 🛍️ 추천 상품 섹션 - 자동 전환 */}
      <div className="relative">
        <p className="text-lg font-semibold text-center mb-2">
          🛍️ 추천 상품
        </p>
        <p className="text-sm text-gray-600 text-center mb-3">
          분실물 걱정 줄이는 인기템 모아봤어요!
        </p>
        {/* 상품 광고 카드 */}
        <div className="mt-3 p-2 bg-yellow-100 border-2 border-yellow-400 rounded-xl text-base leading-relaxed shadow-md mx-auto" style={{maxWidth:'340px',margin:'0 auto'}}>
          <div
            className="text-blue-700 font-extrabold text-center"
            style={{ color: '#1d4ed8', fontWeight: 800 }}
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
          >
            <span className="px-6 py-3 bg-green-600 text-white font-extrabold rounded-lg text-lg hover:bg-green-700 transition-colors duration-200 shadow-lg">
              👉 지금 쿠팡에서 확인하기
            </span>
          </a>
        </div>
        {/* 상품 인디케이터 */}
        <div className="flex justify-center space-x-2 mt-2 mb-1" style={{gap:'6px'}}>
          {sampleProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentProductIndex(index)}
              className={`w-2 h-2 rounded-full border-none outline-none transition-colors duration-200 focus:outline-none focus:ring-0 ${
                index === currentProductIndex 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              style={{ boxShadow: 'none', minWidth: '8px', minHeight: '8px', padding: 0 }}
              aria-label={`상품 ${index + 1} 보기`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
