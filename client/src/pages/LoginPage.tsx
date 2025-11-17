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
    <div style={{ paddingBottom: 92, minHeight: '100vh' }}>
      {/* ✅ 로그인 전이므로 TopBar에 isLoggedIn={false} → 로그아웃 버튼 숨김 */}
      <TopBar isLoggedIn={false} onLogout={onLogout} />
      <div style={{ 
        padding: '40px 16px', 
        maxWidth: 480, 
        width: '100%',
        minWidth: 0,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box' // padding 포함한 너비 계산
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 8,
          color: '#111827'
        }}>
          로그인
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: 32,
          fontSize: 14
        }}>
          계정에 로그인하여 분실물을 관리하세요
        </p>
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  );
};

export default LoginPage;
