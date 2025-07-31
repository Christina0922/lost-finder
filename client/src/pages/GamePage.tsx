import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';
import './GamePage.css';

interface GamePageProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
}

const GamePage: React.FC<GamePageProps> = ({ currentUser, theme }) => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentItem, setCurrentItem] = useState('');
  const [foundItems, setFoundItems] = useState<string[]>([]);

  const items = [
    '지갑', '핸드폰', '노트북', '카드', '열쇠', '가방', '시계', '반지',
    '책', '우산', '모자', '장갑', '목도리', '선글라스', '이어폰', '충전기'
  ];

  const handleStartGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setFoundItems([]);
    generateNewItem();
  };

  const generateNewItem = () => {
    const availableItems = items.filter(item => !foundItems.includes(item));
    if (availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      setCurrentItem(randomItem);
    }
  };

  const handleFindItem = () => {
    if (currentItem && !foundItems.includes(currentItem)) {
      setScore(prev => prev + 10);
      setFoundItems(prev => [...prev, currentItem]);
      generateNewItem();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft]);

  return (
    <div className={`game-page ${theme}`}>
      <div className="game-container">
        {/* 헤더 */}
        <div className="game-header">
          <button className="back-button" onClick={handleBack}>
            ← 뒤로가기
          </button>
          <h1>분실물 찾기 게임</h1>
        </div>

        {/* 게임 정보 */}
        <div className="game-info">
          <div className="score-board">
            <div className="score-item">
              <span className="label">점수:</span>
              <span className="value">{score}</span>
            </div>
            <div className="score-item">
              <span className="label">시간:</span>
              <span className="value">{timeLeft}초</span>
            </div>
            <div className="score-item">
              <span className="label">찾은 물건:</span>
              <span className="value">{foundItems.length}개</span>
            </div>
          </div>
        </div>

        {/* 게임 영역 */}
        <div className="game-area">
          {!isPlaying ? (
            <div className="game-start">
              {timeLeft === 0 ? (
                <div className="game-over">
                  <h2>게임 종료!</h2>
                  <p>최종 점수: {score}점</p>
                  <p>찾은 물건: {foundItems.length}개</p>
                  <button className="start-button" onClick={handleStartGame}>
                    다시 시작
                  </button>
                </div>
              ) : (
                <div className="game-intro">
                  <h2>게임 설명</h2>
                  <p>화면에 나타나는 분실물을 찾아보세요!</p>
                  <p>각 물건을 찾으면 10점을 획득합니다.</p>
                  <p>60초 안에 최대한 많은 물건을 찾아보세요!</p>
                  <button className="start-button" onClick={handleStartGame}>
                    게임 시작
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="game-play">
              <div className="current-item">
                <h3>찾아야 할 물건:</h3>
                <div className="item-display">{currentItem}</div>
              </div>
              
              <div className="game-controls">
                <button className="find-button" onClick={handleFindItem}>
                  찾았어요! 🎯
                </button>
              </div>

              <div className="found-items">
                <h4>찾은 물건들:</h4>
                <div className="items-grid">
                  {foundItems.map((item, index) => (
                    <div key={index} className="found-item">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 쿠팡 광고 */}
      <div className="ad-banner">
        <div className="ad-content">
          <div className="ad-icon">🔍</div>
          <div className="ad-text">
            <h4>놓치지 마세요! 분실 방지 용품 인기 상품 모음 👀</h4>
            <p>내 소지품을 지키는 스마트한 아이템 모음</p>
          </div>
          <button className="ad-button">쿠팡에서 보기</button>
        </div>
      </div>
    </div>
  );
};

export default GamePage; 