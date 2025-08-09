// C:\LostFinderProject\client\src\pages\GamePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import './GamePage.css';

interface GamePageProps {
  currentUser?: User | null;
}

const GamePage: React.FC<GamePageProps> = ({ currentUser = null }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // 게임 사이트로 자동 이동
    window.open('https://3match-game.vercel.app/', '_blank');
    // 현재 페이지는 뒤로 이동
    navigate(-1);
  }, [navigate]);

  return (
    <div className="game-page">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        textAlign: 'center'
      }}>
        <h1>🎮 게임 로딩 중...</h1>
        <p>새 창에서 게임이 열립니다.</p>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          뒤로 가기
        </button>
      </div>
    </div>
  );
};

export default GamePage;
