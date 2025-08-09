// C:\LostFinderProject\client\src\pages\MainPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';
import './MainPage.css';
import BottomBanner from '../components/BottomBanner';

interface MainPageProps {
  currentUser?: User | null;
}

const MainPage: React.FC<MainPageProps> = ({ currentUser = null }) => {
  return (
    <div className="main-page">
      <h1>LostFinder 메인</h1>
      <p>{currentUser ? `${currentUser.username} 님 환영합니다` : '로그인하지 않음'}</p>
      <nav className="nav">
        <Link to="/list">목록</Link>
        <Link to="/add">등록</Link>
        <Link to="/game">게임</Link>
      </nav>
      <BottomBanner />
    </div>
  );
};

export default MainPage;
