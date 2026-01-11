import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LostItem, User } from '../types';

interface MapPageProps {
  lostItems: LostItem[];
  currentUser: User | null;
}

export default function MapPage({ lostItems, currentUser }: MapPageProps) {
  const navigate = useNavigate();
  const lostItemsCount = lostItems?.length || 0;

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
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
        }}>
          🗺️
        </div>
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#2d3748',
          marginBottom: '15px',
        }}>
          지도 기능 준비 중
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#4a5568',
          marginBottom: '10px',
          lineHeight: '1.6'
        }}>
          분실물 위치를 지도에서 확인할 수 있는<br />
          기능을 준비하고 있습니다.
        </p>

        <p style={{
          fontSize: '16px',
          color: '#718096',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          현재 <strong style={{ color: '#667eea', fontSize: '18px' }}>{lostItemsCount}개</strong>의 분실물이 등록되어 있습니다.<br />
          목록에서 확인하거나 새로운 분실물을 등록해주세요.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/list')}
            style={{
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            목록에서 보기
          </button>
          
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '15px 30px',
              backgroundColor: '#f8f9fa',
              color: '#2d3748',
              border: '2px solid #667eea',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              WebkitFontSmoothing: 'antialiased',
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.color = '#2d3748';
            }}
          >
            메인으로
          </button>
        </div>
      </div>
    </div>
  );
}
