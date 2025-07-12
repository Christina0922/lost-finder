import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';
import { User } from '../App';
import BottomBanner from '../components/BottomBanner';

interface MainPageProps {
  currentUser: User | null;
}

const MainPage: React.FC<MainPageProps> = ({ currentUser }) => {
  return (
    <div className="main-container">
      <h1 className="main-title">분실물 찾기 서비스</h1>
      <p className="main-desc">킥보드, 자전거, 택배 등 분실물을 찾으세요</p>
      <div className="main-actions">
        <Link to="/register" className="main-button">분실물<br />등록하기</Link>
        <Link to="/list" className="main-button">분실물<br />목록 보기</Link>
      </div>
      <hr className="main-divider" />
      {/* ✅ 하단 배너 삽입 */}
      <BottomBanner />
    </div>
  );
};

export default MainPage;