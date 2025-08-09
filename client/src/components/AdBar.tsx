import React from 'react';
import { nextCoupangLink } from '../utils/coupang';

const AdBar: React.FC = () => {
  const handleCoupangClick = () => {
    const url = nextCoupangLink();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFE4B5',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '1px solid #ddd',
      zIndex: 1000
    }}>
      <div style={{
        flex: 1,
        color: '#000000',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        분실 방지 용품 인기 상품 모음
      </div>
      
      <button
        onClick={handleCoupangClick}
        aria-label="쿠팡 파트너스 링크 열기"
        style={{
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        쿠팡에서 보기
      </button>
    </div>
  );
};

export default AdBar;
