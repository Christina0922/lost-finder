import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';
import './HomePage.css';

interface HomePageProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
}

const HomePage: React.FC<HomePageProps> = ({ currentUser, theme }) => {
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const menuItems = [
    {
      id: 'register',
      title: '분실물 등록하기',
      description: '잃어버린 물건을 등록하세요',
      icon: '📝',
      path: '/register',
      color: '#4CAF50'
    },
    {
      id: 'list',
      title: '목록 보기',
      description: '등록된 분실물을 확인하세요',
      icon: '📋',
      path: '/list',
      color: '#2196F3'
    },
    {
      id: 'reviews',
      title: '후기 보기',
      description: '다른 사용자들의 후기를 확인하세요',
      icon: '⭐',
      path: '/success-stories',
      color: '#FF9800'
    },
    {
      id: 'game',
      title: '기다리면서 게임하기',
      description: '재미있는 게임을 즐겨보세요',
      icon: '🎮',
      path: '/game',
      color: '#9C27B0'
    }
  ];

  return (
    <div className={`home-page ${theme}`}>
      {/* 헤더 */}
      <div className="home-header">
        <h1 className="home-title">분실물 찾기</h1>
        <p className="home-subtitle">잃어버린 물건을 쉽게 찾아보세요</p>
      </div>

      {/* 메뉴 그리드 */}
      <div className="menu-grid">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="menu-card"
            style={{ borderColor: item.color }}
            onClick={() => handleMenuClick(item.path)}
          >
            <div className="menu-icon" style={{ backgroundColor: item.color }}>
              {item.icon}
            </div>
            <div className="menu-content">
              <h3 className="menu-title">{item.title}</h3>
              <p className="menu-description">{item.description}</p>
            </div>
            <div className="menu-arrow">→</div>
          </div>
        ))}
      </div>

      {/* 로그인 안내 */}
      {!currentUser && (
        <div className="login-notice">
          <p>메뉴를 사용하려면 로그인이 필요합니다</p>
          <button 
            className="login-button"
            onClick={() => navigate('/login')}
          >
            로그인하기
          </button>
        </div>
      )}

      {/* 하단 고정 쿠팡 광고 */}
      <div className="ad-banner">
        <div className="ad-content">
          <div className="ad-icon">🔍</div>
          <div className="ad-text">
            <h4>👀 분실 방지 용품 인기 상품 모음</h4>
            <p>AirTag, 가방 위치 추적기, 열쇠고리형 블루투스 위치기기</p>
          </div>
          <button className="ad-button">쿠팡에서 보기</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 