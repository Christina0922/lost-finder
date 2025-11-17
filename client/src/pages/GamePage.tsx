import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import KoreanSpellingQuiz from '../components/KoreanSpellingQuiz';
import EnglishWordOrder from '../components/EnglishWordOrder';
import CoupangAd from '../components/CoupangAd';
import './GamePage.css';

interface Props {
  currentUser?: User;
}

type GameMode = 'korean' | 'english';

const GamePage: React.FC<Props> = ({ currentUser }) => {
  const [gameMode, setGameMode] = useState<GameMode>('korean');
  const [profile, setProfile] = useState<any>(null);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [loading, setLoading] = useState(true);
  // userId를 number로 변환 (string이면 parseInt, 없으면 1)
  const userId: number = currentUser?.id 
    ? (typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) : currentUser.id)
    : 1;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/game/profile/${userId}`);
      const data = await response.json();
      if (data.ok && data.profile) {
        setProfile(data.profile);
        setAdsRemoved(data.profile.ads_removed === 1);
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
      // 기본 프로필 생성
      setProfile({ coins: 100, ads_removed: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (correct: boolean, coinsEarned: number) => {
    // 프로필 업데이트
    if (profile) {
      setProfile({
        ...profile,
        coins: profile.coins + coinsEarned
      });
    }
  };

  const handleRewardClick = async () => {
    // 쿠팡 클릭 시 코인 보상
    try {
      const response = await fetch('http://localhost:5000/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          puzzleType: 'reward',
          puzzleId: 0,
          answer: 'coupang_click',
          correct: true
        })
      });
      
      const data = await response.json();
      if (data.ok && data.profile) {
        setProfile(data.profile);
        alert('🎁 코인 10개를 받았습니다!');
      }
    } catch (error) {
      console.error('보상 지급 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="game-page-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="game-page-container">
      <div className="game-header">
        <h1 className="game-title">🧠 Genius Brain - 두뇌 훈련 게임</h1>
        <div className="mode-tabs">
          <button
            className={`tab-button ${gameMode === 'korean' ? 'active' : ''}`}
            onClick={() => setGameMode('korean')}
          >
            🇰🇷 한글 맞춤법
          </button>
          <button
            className={`tab-button ${gameMode === 'english' ? 'active' : ''}`}
            onClick={() => setGameMode('english')}
          >
            🇺🇸 영어 단어 순서
          </button>
        </div>
      </div>

      <div className="game-content">
        {gameMode === 'korean' ? (
          <KoreanSpellingQuiz
            userId={userId}
            profile={profile}
            onAnswerSubmit={handleAnswerSubmit}
          />
        ) : (
          <EnglishWordOrder
            userId={userId}
            profile={profile}
            onAnswerSubmit={handleAnswerSubmit}
          />
        )}
      </div>

      {/* 쿠팡 광고 - 광고 제거가 아니면 표시 */}
      {!adsRemoved && (
        <>
          {/* 퍼즐 완료 후 보상형 광고 */}
          <div className="ad-section">
            <CoupangAd
              type="reward"
              title={
                gameMode === 'korean'
                  ? "이 단어와 관련된 학습 교재 보기 📚"
                  : "이 문장이 나오는 영어 원서 보기 📖"
              }
              description="쿠팡에서 보면 코인 보너스도 받아요!"
              showReward={true}
              onRewardClick={handleRewardClick}
            />
          </div>

          {/* 하단 고정 배너 */}
          <div className="fixed-banner">
            <CoupangAd
              type="banner"
              title="오늘의 추천 학습 상품"
            />
          </div>
        </>
      )}

      {/* 상점 버튼 (광고 제거, 코인 구매) */}
      <div className="shop-section">
        <h3 className="shop-title">🛒 상점</h3>
        <div className="shop-items">
          <button
            className="shop-item"
            onClick={async () => {
              if (window.confirm('광고 제거를 구매하시겠습니까? (5,900원)')) {
                try {
                  const response = await fetch('http://localhost:5000/api/game/purchase/ad-removal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, amount: 5900 })
                  });
                  const data = await response.json();
                  if (data.ok) {
                    setProfile(data.profile);
                    setAdsRemoved(true);
                    alert('광고가 제거되었습니다!');
                  }
                } catch (error) {
                  alert('구매에 실패했습니다.');
                }
              }
            }}
          >
            광고 제거
            <div className="shop-price">5,900원</div>
          </button>
          <button
            className="shop-item"
            onClick={async () => {
              if (window.confirm('1,000 코인을 구매하시겠습니까? (1,000원)')) {
                try {
                  const response = await fetch('http://localhost:5000/api/game/purchase/coins', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, coinAmount: 1000, amount: 1000 })
                  });
                  const data = await response.json();
                  if (data.ok) {
                    setProfile(data.profile);
                    alert('코인을 구매했습니다!');
                  }
                } catch (error) {
                  alert('구매에 실패했습니다.');
                }
              }
            }}
          >
            코인 1,000개
            <div className="shop-price">1,000원</div>
          </button>
          <button
            className="shop-item"
            onClick={async () => {
              if (window.confirm('3,000 코인을 구매하시겠습니까? (3,000원)')) {
                try {
                  const response = await fetch('http://localhost:5000/api/game/purchase/coins', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, coinAmount: 3000, amount: 3000 })
                  });
                  const data = await response.json();
                  if (data.ok) {
                    setProfile(data.profile);
                    alert('코인을 구매했습니다!');
                  }
                } catch (error) {
                  alert('구매에 실패했습니다.');
                }
              }
            }}
          >
            코인 3,000개
            <div className="shop-price">3,000원</div>
          </button>
          <button
            className="shop-item"
            onClick={async () => {
              if (window.confirm('9,000 코인을 구매하시겠습니까? (9,000원)')) {
                try {
                  const response = await fetch('http://localhost:5000/api/game/purchase/coins', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, coinAmount: 9000, amount: 9000 })
                  });
                  const data = await response.json();
                  if (data.ok) {
                    setProfile(data.profile);
                    alert('코인을 구매했습니다!');
                  }
                } catch (error) {
                  alert('구매에 실패했습니다.');
                }
              }
            }}
          >
            코인 9,000개
            <div className="shop-price">9,000원</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
