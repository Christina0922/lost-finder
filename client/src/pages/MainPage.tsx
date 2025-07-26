import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';
import type { User } from '../App';
import BottomBanner from '../components/BottomBanner';

interface MainPageProps {
  currentUser: User | null;
  lostItems: any[];
  onAddItem: (item: any) => void;
  theme: 'light' | 'dark';
}

const MainPage: React.FC<MainPageProps> = ({ currentUser, lostItems, onAddItem, theme }) => {
  return (
    <div className="main-container" style={{ paddingTop: '8px' }}>
      <h1 className="main-title">분실물 찾기 서비스</h1>
              <p className="main-desc">지금 바로 등록하고 찾아보세요!</p>
      <div className="button-group">
        <Link to="/edit/new" className="btn primary">등록하기</Link>
        <Link to="/list" className="btn secondary">목록 보기</Link>
      </div>
      <hr className="main-divider" />
      {/* ✅ 하단 배너 삽입 */}
      <BottomBanner />
    </div>
  );
};

export default MainPage;