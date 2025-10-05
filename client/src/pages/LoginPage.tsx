// C:\LostFinderProject\client\src\pages\LoginPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from '../types';
import TopBar from '../components/TopBar';
import LoginForm from '../components/LoginForm';

interface Props {
  currentUser?: User | null;
  onLogout: () => void;
  onLogin: (user: any) => void;
}

const LoginPage: React.FC<Props> = ({ currentUser, onLogout, onLogin }) => {
  // ✅ 이미 로그인 상태라면 로그인 폼을 보여주지 않고 홈으로 리디렉션
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ paddingBottom: 92 }}>
      {/* ✅ 로그인 전이므로 TopBar에 isLoggedIn={false} → 로그아웃 버튼 숨김 */}
      <TopBar isLoggedIn={false} onLogout={onLogout} />
      <div style={{ padding: '16px 16px 24px' }}>
        <h2 style={{ textAlign: 'center' }}>로그인</h2>
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  );
};

export default LoginPage;
