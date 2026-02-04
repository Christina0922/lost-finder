import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    title: "Apple AirTag",
    description: "가방, 지갑, 자전거 분실 방지<br/>실시간 위치 추적 가능",
    image: "https://via.placeholder.com/80x80/667eea/FFFFFF?text=AirTag",
    price: "39,000원",
    link: "https://link.coupang.com/a/cCIDpH",
    category: "분실방지"
  },
  {
    id: 2,
    title: "스마트 키홀더",
    description: "키 찾기 한 번에 해결<br/>실시간 위치 추적 기능",
    image: "https://via.placeholder.com/80x80/667eea/FFFFFF?text=Key",
    price: "15,900원",
    link: "https://link.coupang.com/a/cCIDpH",
    category: "분실방지"
  },
  {
    id: 3,
    title: "RFID 방지 지갑",
    description: "카드 정보 보호<br/>도난 방지 기능 탑재",
    image: "https://via.placeholder.com/80x80/667eea/FFFFFF?text=Wallet",
    price: "29,800원",
    link: "https://link.coupang.com/a/cCIDpH",
    category: "보안"
  }
];

export default function BottomBanner() {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const navigate = useNavigate();

  // 5초마다 상품 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % sampleProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentProduct = sampleProducts[currentProductIndex];

  return (
    <div className="w-full px-2 py-2 mt-2 mb-4 rounded-2xl shadow-md space-y-2 text-center bottom-banner" style={{
      background: 'linear-gradient(135deg, #f8f9ff 0%, #f5f7ff 100%)',
      border: '1px solid rgba(102, 126, 234, 0.1)',
      paddingTop: '7.53px',
      paddingBottom: '7.53px',
      marginTop: '7.53px',
      marginBottom: '15.05px'
    }}>
      {/* 감동 후기 섹션 */}
      <div>
        <p className="text-lg font-semibold bottom-banner-title" style={{ 
          textAlign: 'center', 
          marginBottom: 7.53, 
          marginTop: 7.53,
          color: '#4a5568',
          fontSize: '1.1rem'
        }}>
          감동 후기 모음
        </p>
        <p className="bottom-banner-desc" style={{ 
          textAlign: 'center', 
          marginBottom: 15.05,
          color: '#718096',
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          찾으셨나요?<br />
          한 줄 후기를 남겨주세요.<br />
          누군가에게 큰 힘이 됩니다.
        </p>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('후기 보러가기 클릭 - 경로: /success-stories');
            try {
              navigate('/success-stories');
            } catch (err) {
              console.error('네비게이션 에러:', err);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '1.47rem',
            padding: '13.17px 30.11px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block'
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}>
          후기 보러가기
        </button>
      </div>
      {/* 구분선 */}
      <hr style={{ 
        border: '0', 
        height: '1px', 
        background: 'linear-gradient(to right, transparent, rgba(102, 126, 234, 0.2), transparent)',
        margin: '15.05px 0'
      }} />
      {/* 퍼즐 게임 안내 섹션 */}
      <div>
        <p className="text-lg font-semibold" style={{
          textAlign: 'center',
          marginBottom: 7.53,
          color: '#4a5568',
          fontSize: '1.1rem'
        }}>
          퍼즐 게임 안내
        </p>
        <p className="text-gray-600" style={{ 
          fontSize: "0.95rem", 
          marginBottom: 11.29, 
          color: "#718096", 
          lineHeight: 1.6
        }}>
          기다리는 동안 잠시 머리를 식힐 수 있는<br />퍼즐 게임은 어떠세요?
        </p>
        <a
          href="https://3match-game-865e.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          title="외부 사이트로 이동합니다"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          <button style={{
            background: '#ffffff',
            color: '#667eea !important',
            border: '2px solid #667eea',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '1.47rem',
            padding: '13.17px 30.11px',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            width: '100%',
            maxWidth: '350px',
            textAlign: 'center',
            WebkitTextFillColor: '#667eea',
            WebkitBackgroundClip: 'unset'
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#667eea';
            e.currentTarget.style.color = '#ffffff !important';
            (e.currentTarget.style as any).webkitTextFillColor = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#667eea !important';
            (e.currentTarget.style as any).webkitTextFillColor = '#667eea';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.1)';
          }}>
            퍼즐 게임하기
          </button>
        </a>
      </div>
      {/* 구분선 */}
      <hr style={{ 
        border: '0', 
        height: '1px', 
        background: 'linear-gradient(to right, transparent, rgba(102, 126, 234, 0.2), transparent)',
        margin: '15.05px 0'
      }} />

      {/* 추천 상품 섹션 */}
      <div className="relative">
        <p className="text-lg font-semibold text-center mb-2" style={{
          color: '#4a5568',
          fontSize: '1.1rem',
          marginBottom: '7.53px'
        }}>
          추천 상품
        </p>
        <p className="text-sm text-gray-600 text-center mb-3" style={{
          color: '#718096',
          fontSize: '0.9rem',
          marginBottom: '11.29px'
        }}>
          분실물 걱정 줄이는 인기템 모아봤어요
        </p>
        {/* 상품 광고 카드 */}
        <div className="mt-2 p-4 rounded-xl text-base leading-relaxed mx-auto" style={{
          maxWidth:'340px',
          margin:'0 auto',
          background: 'transparent',
          marginTop: '7.53px',
          padding: '15.05px'
        }}>
          <div
            className="text-center"
            style={{ 
              color: '#4a5568', 
              fontWeight: 500, 
              fontSize: '14px',
              marginBottom: '11.29px',
              lineHeight: '1.6'
            }}
            dangerouslySetInnerHTML={{
              __html: currentProduct.description
            }}
          />
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const url = currentProduct.link || "https://link.coupang.com/a/cCIDpH";
              try {
                window.open(url, "_blank", "noopener,noreferrer");
              } catch (err) {
                console.error('링크 열기 에러:', err);
              }
            }}
            style={{ 
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              fontWeight: 600,
              borderRadius: '12px',
              fontSize: '14px',
              padding: '9.41px 22.58px',
              border: 'none',
              whiteSpace: 'nowrap',
              minWidth: '200px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              textDecoration: 'none'
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}>
              쿠팡에서 확인하기
            </button>
        </div>
      </div>
    </div>
  );
}
