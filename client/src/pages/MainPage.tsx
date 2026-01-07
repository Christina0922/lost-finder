import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import './MainPage.css';
import type { User } from '../App';
import BottomBanner from '../components/BottomBanner';

interface MainPageProps {
  currentUser: User | null;
  lostItems: any[];
  onAddItem: (item: any) => void;
  theme: 'light' | 'dark';
}

const MainPage: React.FC<MainPageProps> = ({ currentUser, lostItems, onAddItem, theme }) => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead 
        title={t('mainPage.title')}
        description={t('mainPage.description')}
      />
      <div className="main-container" style={{ paddingTop: '8px' }}>
        <h1 className="main-title">{t('mainPage.title')}</h1>
      <p className="main-desc">{t('mainPage.description')}</p>
      <div className="button-group">
        <Link to="/map" className="btn primary">{t('mainPage.mapButton') || '지도에서 찾기'}</Link>
        <Link to="/edit/new" className="btn secondary">{t('mainPage.registerButton')}</Link>
        <Link to="/list" className="btn tertiary">{t('mainPage.listButton')}</Link>
      </div>
      {/* ✅ 하단 배너 삽입 */}
      <BottomBanner />
      </div>
    </>
  );
};

export default MainPage;