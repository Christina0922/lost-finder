// C:\LostFinderProject\client\src\pages\MainPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner'; // ✅ 추가

interface Props {
  currentUser: User | null;
  onLogout: () => void; // ← App.tsx에서 전달
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
      background: '#ffffff',
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

const MainPage: React.FC<Props> = ({ currentUser, onLogout }) => {
  const name = currentUser?.username || currentUser?.name || currentUser?.email || '게스트';

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} onLogout={onLogout} />

      <div style={{ padding: '16px 16px 24px' }}>
        <p style={{ color: '#6b7280', textAlign: 'center', margin: '8px 0 16px' }}>
          잃어버린 물건을 쉽게 찾으세요
        </p>

        <div style={{ display: 'grid', gap: 16 }}>
          {/* 분실물 관리 섹션 */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: 16 }}>🔍 분실물 관리</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <Card to="/add" icon="➕" title="분실물 등록하기" subtitle="분실물을 등록하세요" />
              <Card to="/list" icon="📋" title="분실물 목록" subtitle="등록된 분실물을 확인하세요" />
              <Card to="/search" icon="🔎" title="분실물 검색" subtitle="키워드로 빠르게 찾기" />
            </div>
          </div>
          
          {/* 사용자 기능 섹션 */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: 16 }}>👤 사용자 기능</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <Card to="/settings" icon="⚙️" title="설정" subtitle="앱 설정 변경" />
              <Card to="/history" icon="📚" title="내 기록" subtitle="활동 내역 확인" />
            </div>
          </div>
          
          {/* 부가 기능 섹션 */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: 16 }}>🎮 부가 기능</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <Card to="/game" icon="🎯" title="게임하기" subtitle="게임하며 기다리기" />
              <Card to="/reviews" icon="⭐" title="리뷰 & 후기" subtitle="성공 사례 읽기" />
              <Card to="/success-stories" icon="🏆" title="성공 사례" subtitle="감동적인 이야기" />
            </div>
          </div>
          
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: '#374151', fontWeight: 700 }}>
          {name} 님
        </div>

        {/* ✅ 쿠팡 배너 추가 (1시간마다 자동 교체) */}
        <div style={{ marginTop: 40 }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
