import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import SEOHead from '../components/SEOHead';
import './MainPage.css';
import type { User } from '../App';
import BottomBanner from '../components/BottomBanner';

interface MainPageProps {
  currentUser: User | null;
  lostItems: any[];
  onAddItem: (item: any) => void;
  theme: 'light' | 'dark';
  onGoogleLogin: (credential: string) => Promise<void>;
}

const MainPage: React.FC<MainPageProps> = ({ currentUser, lostItems, onAddItem, theme, onGoogleLogin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    // 로그인하지 않은 경우 Google 로그인 표시
    if (!currentUser) {
      setShowLogin(true);
    }
  }, [currentUser]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        await onGoogleLogin(credentialResponse.credential);
        setShowLogin(false);
      } catch (error) {
        console.error('Google 로그인 오류:', error);
        alert('Google 로그인에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleGoogleError = () => {
    console.error('Google 로그인 실패');
    alert('Google 로그인에 실패했습니다.');
  };

  if (!googleClientId) {
    console.warn('Google Client ID가 설정되지 않았습니다.');
  }

  return (
    <>
      <SEOHead 
        title={t('mainPage.title')}
        description={t('mainPage.description')}
      />
      <div className="main-container" style={{ paddingTop: '8px' }}>
        <h1 className="main-title">{t('mainPage.title')}</h1>
        <p className="main-desc">{t('mainPage.description')}</p>
        
        {/* Google 로그인 섹션 */}
        {!currentUser && showLogin && googleClientId && (
          <div style={{
            margin: '24px auto',
            padding: '24px',
            maxWidth: '400px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              marginBottom: '16px',
              color: '#667eea',
              fontSize: '1.25rem'
            }}>
              🔐 Google 계정으로 시작하기
            </h3>
            <p style={{ 
              marginBottom: '20px',
              color: '#718096',
              fontSize: '0.95rem'
            }}>
              분실물을 등록하고 검색하려면 Google 계정으로 로그인하세요
            </p>
            <GoogleOAuthProvider clientId={googleClientId}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center' 
              }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  text="continue_with"
                  shape="rectangular"
                  theme="filled_blue"
                  size="large"
                  width="350"
                  locale="ko"
                />
              </div>
            </GoogleOAuthProvider>
          </div>
        )}

        {/* 기존 버튼들 */}
        <div className="button-group">
          <Link to="/edit/new" className="btn primary">{t('mainPage.registerButton')}</Link>
          <Link to="/list" className="btn secondary">{t('mainPage.listButton')}</Link>
        </div>
        
        <hr className="main-divider" />
        {/* ✅ 하단 배너 삽입 */}
        <BottomBanner />
      </div>
    </>
  );
};

export default MainPage;

