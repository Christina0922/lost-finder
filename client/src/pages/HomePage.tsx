// C:\LostFinderProject\client\src\pages\HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';
import TopBar from '../components/TopBar';

interface Props {
  currentUser?: User | null;
  onLogout: () => void;
}

const Card: React.FC<{ to: string; icon: string; title: string; subtitle: string; }> = ({ to, icon, title, subtitle }) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: 16,
      borderRadius: 12,
      background: '#fff',
      color: '#111827',
      textDecoration: 'none',
      boxShadow: '0 1px 5px rgba(0,0,0,.12)'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 26 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{subtitle}</div>
      </div>
    </div>
    <span style={{ opacity: .6 }}>→</span>
  </Link>
);

const HomePage: React.FC<Props> = ({ currentUser, onLogout }) => {
  const name = currentUser?.username || currentUser?.name || currentUser?.email || '게스트';

  return (
    <div style={{ paddingBottom: 92 /* 쿠팡 배너 높이만큼 여백 */ }}>
      <TopBar isLoggedIn={!!currentUser} onLogout={onLogout} />

      <div style={{ padding: '16px 16px 24px' }}>
        <p style={{ color: '#6b7280', textAlign: 'center', margin: '8px 0 16px' }}>
          잃어버린 물건을 쉽게 찾으세요
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          <Card to="/add"     icon="➕" title="분실물 등록하기"  subtitle="분실물을 등록하세요" />
          <Card to="/list"    icon="📋" title="목록 보기"       subtitle="등록된 분실물을 확인하세요" />
          <Card to="/reviews" icon="💬" title="분실물 후기 보기" subtitle="성공 사례 먼저 읽기" />
          <Card to="/game"    icon="🎮" title="기다리면서 게임하기" subtitle="잠깐 쉬며 마음 진정" />
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: '#374151', fontWeight: 700 }}>
          {name} 님
        </div>
      </div>
    </div>
  );
};

export default HomePage;
