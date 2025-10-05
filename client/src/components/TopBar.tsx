// C:\LostFinderProject\client\src\components\TopBar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const TopBar: React.FC<Props> = ({ isLoggedIn, onLogout }) => {
  const loc = useLocation();

  // 현재 경로에 따른 버튼 스타일 결정
  const getButtonStyle = (path: string) => {
    const isActive = loc.pathname === path;
    return {
      ...btnStyle,
      background: isActive ? '#1e40af' : '#38bdf8',
      fontWeight: isActive ? 800 : 700,
      boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0ea5e9', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 8 }}>
        <strong style={{ fontSize: 18 }}>LostFinder</strong>
        <span style={{ marginLeft: 'auto' }} />
        {/* 상단 메뉴 (필요 시 유지) */}
      </div>

      {/* 첫 번째 메뉴 줄: 홈, 목록, 등록하기 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '8px 12px', background: '#0284c7' }}>
        <Link 
          to="/" 
          className="btn" 
          style={getButtonStyle('/')}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (loc.pathname !== '/') {
              e.currentTarget.style.background = '#1d4ed8';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (loc.pathname !== '/') {
              e.currentTarget.style.background = '#38bdf8';
            }
          }}
        >
          홈
        </Link>
        <Link 
          to="/list" 
          className="btn" 
          style={getButtonStyle('/list')}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (loc.pathname !== '/list') {
              e.currentTarget.style.background = '#1d4ed8';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (loc.pathname !== '/list') {
              e.currentTarget.style.background = '#38bdf8';
            }
          }}
        >
          목록
        </Link>
        <Link 
          to="/add" 
          className="btn" 
          style={getButtonStyle('/add')}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (loc.pathname !== '/add') {
              e.currentTarget.style.background = '#1d4ed8';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (loc.pathname !== '/add') {
              e.currentTarget.style.background = '#38bdf8';
            }
          }}
        >
          등록하기
        </Link>
      </div>

      {/* 두 번째 메뉴 줄: 후기 쓰기, 로그아웃/로그인 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '8px 12px', background: '#0284c7' }}>
        <Link 
          to="/reviews" 
          className="btn" 
          style={getButtonStyle('/reviews')}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (loc.pathname !== '/reviews') {
              e.currentTarget.style.background = '#1d4ed8';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (loc.pathname !== '/reviews') {
              e.currentTarget.style.background = '#38bdf8';
            }
          }}
        >
          후기 쓰기
        </Link>

        {/* ✅ 로그인 상태일 때만 로그아웃 표시 */}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={onLogout}
            className="btn"
            style={{ ...btnStyle, background: '#ef4444' }}
          >
            로그아웃
          </button>
        ) : (
          // 로그인 페이지가 아닐 때만 로그인 버튼(선택)
          loc.pathname !== '/login' ? (
            <Link to="/login" className="btn" style={{ ...btnStyle, background: '#10b981' }}>
              로그인
            </Link>
          ) : <span />
        )}
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  textAlign: 'center',
  background: '#38bdf8',
  color: '#fff',
  padding: '10px 0',
  borderRadius: 10,
  textDecoration: 'none',
  fontWeight: 700,
};

export default TopBar;
