// C:\LostFinderProject\client\src\pages\HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import CoupangBanner from '../components/CoupangBanner';
import './HomePage.css';

interface HomePageProps {
  currentUser?: User | null;
}

const HomePage: React.FC<HomePageProps> = ({ currentUser = null }) => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>LostFinder</h1>
        <div>{currentUser ? `${currentUser.username} 님` : '게스트'}</div>
      </header>

      <div className="home-actions">
        <button onClick={() => navigate('/list')}>분실물 목록</button>
        <button onClick={() => navigate('/add')}>분실물 등록</button>
      </div>

      <CoupangBanner coupangLinks={[
        "https://link.coupang.com/a/cIFtru", // 🚨 뇌울림 3.0 PRO 도난방지 경보기
        "https://link.coupang.com/a/cIFumx", // 📍 갤럭시 스마트태그2 위치추적
        "https://link.coupang.com/a/cIFuZl", // 🔒 레오바니 자물쇠
        "https://link.coupang.com/a/cIFvsF", // 🍏 Apple 에어태그
        "https://link.coupang.com/a/cIFv4K"  // 🧷 스프링 고리형 스트랩 (5개)
      ]} />
    </div>
  );
};

export default HomePage;
