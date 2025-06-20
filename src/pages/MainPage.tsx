import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';
import { User } from '../App';

interface MainPageProps {
  currentUser: User | null;
}

const MainPage: React.FC<MainPageProps> = ({ currentUser }) => {
  return (
    <div className="main-container">
      <h1>분실물 찾기 서비스</h1>
      <p>킥보드, 자전거, 택배 등 분실물을 찾으세요</p>
      
      <div className="main-actions">
        <Link to="/register" className="main-button">분실물 등록하기</Link>
        <Link to="/list" className="main-button">분실물 목록 보기</Link>
      </div>
    </div>
  );
};

export default MainPage; 