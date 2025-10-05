// C:\LostFinderProject\client\src\pages\GamePage.tsx
import React from 'react';
import type { User } from '../types';

/**
 * 하단 쿠팡 배너가 고정되어 있으므로, iframe 높이를
 * 배너 높이(약 92px)만큼 제외해 전 화면에 맞춥니다.
 * 필요시 값은 조정하셔도 됩니다.
 */
interface Props {
  currentUser?: User; // 사용은 안 하지만 App 라우팅과 타입 맞추기용
}

const GamePage: React.FC<Props> = () => {
  return (
    <div
      className="game-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        background: '#ffffff',
        paddingBottom: 92, // 고정 배너 영역 확보
        position: 'relative',
      }}
    >
      {/* 완전한 흰색 배경 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#ffffff',
          background: '#ffffff',
          zIndex: 1,
        }}
      />
      
      <iframe
        title="LostFinder-3Match-Game"
        src="https://3match-game-865e.vercel.app/"
        style={{
          display: 'block',
          width: '100%',
          height: 'calc(100vh - 92px)', // 배너만큼 제외
          border: 'none',
          backgroundColor: '#ffffff',
          background: '#ffffff',
          position: 'relative',
          zIndex: 2,
          opacity: 0.99, // 미묘하게 투명도 조정
        }}
        allowFullScreen
      />
    </div>
  );
};

export default GamePage;
