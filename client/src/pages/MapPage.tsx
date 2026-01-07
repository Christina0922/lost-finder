import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        maxWidth: '600px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#2d3748',
          marginBottom: '20px',
        }}>
          🗺️ 지도 페이지
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#4a5568',
          marginBottom: '30px',
        }}>
          지도 페이지가 정상적으로 로드되었습니다!
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
          }}
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}
