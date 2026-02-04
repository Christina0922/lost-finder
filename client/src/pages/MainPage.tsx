import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import './MainPage.css';
import type { User } from '../App';
import BottomBanner from '../components/BottomBanner';
import ErrorBoundary from '../components/ErrorBoundary';

interface MainPageProps {
  currentUser: User | null;
  lostItems: any[];
  onAddItem: (item: any) => void;
  theme: 'light' | 'dark';
}

const MainPage: React.FC<MainPageProps> = ({ currentUser, lostItems, onAddItem, theme }) => {
  const { t, ready } = useTranslation();
  
  // i18n이 준비되지 않았거나 번역이 없을 경우 기본 텍스트 사용
  const title = ready && t('mainPage.title') !== 'mainPage.title' 
    ? t('mainPage.title') 
    : '분실물 찾기 서비스';
  const description = ready && t('mainPage.description') !== 'mainPage.description'
    ? t('mainPage.description')
    : '지금 바로 등록하고 찾아보세요!';
  const mapButton = ready && t('mainPage.mapButton') !== 'mainPage.mapButton'
    ? t('mainPage.mapButton')
    : '지도에서 찾기';
  const registerButton = ready && t('mainPage.registerButton') !== 'mainPage.registerButton'
    ? t('mainPage.registerButton')
    : '등록하기';
  const listButton = ready && t('mainPage.listButton') !== 'mainPage.listButton'
    ? t('mainPage.listButton')
    : '목록 보기';

  console.log('MainPage 렌더링:', { title, description, ready });

  try {
    return (
      <>
        <SEOHead 
          title={title}
          description={description}
        />
        <div 
          className="main-container" 
          style={{ 
            padding: '24px 20px',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            maxWidth: '800px',
            margin: '16px auto',
            minHeight: '200px'
          }}
        >
          {/* LostFinder (왼쪽 정렬) */}
          <div style={{ 
            textAlign: 'left',
            marginBottom: '12px'
          }}>
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none',
                color: '#667eea',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              LostFinder
            </Link>
          </div>
          
          {/* 분실물 찾기 서비스 (가운데 정렬, 한 줄) */}
          <h1 
            className="main-title" 
            style={{ 
              color: '#667eea', 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              margin: '0 auto 12px auto',
              padding: '0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'block',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            {title}
          </h1>
          
          {/* 지금 바로 등록하고 찾아보세요 (가운데 정렬) */}
          <p 
            className="main-desc" 
            style={{ 
              color: '#718096', 
              fontSize: '1rem', 
              marginBottom: '20px',
              lineHeight: '1.5',
              display: 'block',
              textAlign: 'center'
            }}
          >
            {description}
          </p>
          <div 
            className="button-group" 
            style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}
          >
            <Link 
              to="/map" 
              className="btn primary"
              style={{ 
                padding: '12px 24px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                display: 'inline-block',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {mapButton}
            </Link>
            <Link 
              to="/edit/new" 
              className="btn secondary"
              style={{ 
                padding: '12px 24px', 
                background: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '2px solid #667eea',
                fontWeight: '600',
                display: 'inline-block',
                cursor: 'pointer'
              }}
            >
              {registerButton}
            </Link>
            <Link 
              to="/list" 
              className="btn tertiary"
              style={{ 
                padding: '12px 24px', 
                background: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '2px solid #667eea',
                fontWeight: '600',
                display: 'inline-block',
                cursor: 'pointer'
              }}
            >
              {listButton}
            </Link>
          </div>
          {/* ✅ 하단 배너 삽입 */}
          <ErrorBoundary>
            <BottomBanner />
          </ErrorBoundary>
        </div>
      </>
    );
  } catch (error) {
    console.error('❌ MainPage 렌더링 에러:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#333', background: '#fff' }}>
        <h2 style={{ color: '#667eea' }}>오류가 발생했습니다</h2>
        <p>{error instanceof Error ? error.message : '알 수 없는 오류'}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '10px 20px', 
            marginTop: '10px', 
            background: '#667eea', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          새로고침
        </button>
      </div>
    );
  }
};

export default MainPage;
