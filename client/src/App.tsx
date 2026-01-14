import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import MainPage from './pages/MainPage';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';
import EditPage from './pages/EditPage';
import MapPage from './pages/MapPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import AdminPanel from './pages/AdminPanel';
import { AlertMode, getAlertMode, setAlertMode as saveAlertMode, triggerAlert } from './utils/notification';
import { initializeDeviceId } from './utils/deviceId';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>오류가 발생했습니다</h2>
          <p>페이지를 새로고침해주세요.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Type definitions - import from types
import type { User, Comment, LostItem } from './types';
export type { User, Comment, LostItem };

export interface Notification {
  id: number;
  userId: number;
  itemId: number;
  message: string;
  read: boolean;
}

// Header Component
const Header: React.FC<{ 
  currentUser: User | null; 
  notifications: Notification[]; 
  onLogout: () => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  alertMode: AlertMode;
  setAlertMode: (m: AlertMode) => void;
  setToast: (toast: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
}> = ({ currentUser, notifications, onLogout, theme, setTheme, alertMode, setAlertMode, setToast }) => {
  const { t, i18n } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setToast({ message: `Language changed to ${lng}`, type: 'success' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        handleCloseSettings();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseSettings();
      }
    };

    const handleTouchOutside = (event: TouchEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        handleCloseSettings();
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('touchstart', handleTouchOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [showSettings]);

  const handleCloseSettings = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsAnimating(false);
    }, 200);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  return (
    <header style={{
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f9fafb' : '#1f2937',
      padding: '1rem',
      borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1 
          style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Lost Finder
        </h1>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {currentUser && (
          <>
            <span style={{ fontSize: '0.9rem' }}>
              {t('header.greeting', { username: currentUser.username })}
            </span>
            
            <button
              onClick={handleOpenSettings}
              style={{
                background: 'none',
                border: 'none',
                cursor: showSettings ? 'default' : 'pointer',
                fontSize: '24px',
                padding: '0',
                margin: '0',
                outline: 'none',
                opacity: showSettings ? 0.5 : 1,
                transition: 'opacity 0.2s ease'
              }}
            >
              ⚙️
            </button>
          </>
        )}
        
        {showSettings && (
          <>
            {/* 반투명 오버레이 */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 999,
                animation: 'fadeIn 0.2s ease'
              }}
              onClick={handleCloseSettings}
            />
            
            {/* 설정 메뉴 */}
            <div 
              ref={settingsRef}
              className="settings-modal"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) ${isAnimating ? 'scale(0.9)' : 'scale(1)'}`,
                width: 'min(90vw, 360px)',
                minWidth: '280px',
                maxHeight: 'min(450px, 85vh)',
                padding: '20px 16px 24px 16px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                zIndex: 1000,
                transition: 'all 0.3s ease-in-out',
                backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.1), 0px 8px 24px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}
            >
              {/* 타이틀 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('header.settings')}</span>
                <button 
                  className="settings-close-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: theme === 'dark' ? '#f9fafb' : '#1f2937'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#e5e7eb';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onClick={handleCloseSettings}
                >
                  ✕
                </button>
              </div>

              {/* 언어 선택 */}
              <div className="settings-section" style={{ marginTop: '8px' }}>
                <p style={{ marginBottom: '12px', fontSize: 'clamp(14px, 2vw, 15px)', fontWeight: '500' }}>🌐 언어 / Language</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2vw, 13px)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: i18n.language === 'ko' ? '#ec4899' : '#e5e7eb',
                      color: i18n.language === 'ko' ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#374151')
                    }}
                    onClick={() => changeLanguage('ko')}
                  >
                    한국어
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2vw, 13px)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: i18n.language === 'en' ? '#ec4899' : '#e5e7eb',
                      color: i18n.language === 'en' ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#374151')
                    }}
                    onClick={() => changeLanguage('en')}
                  >
                    English
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2vw, 13px)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: i18n.language === 'ja' ? '#ec4899' : '#e5e7eb',
                      color: i18n.language === 'ja' ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#374151')
                    }}
                    onClick={() => changeLanguage('ja')}
                  >
                    日本語
                  </button>
                </div>
              </div>

              {/* 테마 */}
              <div className="settings-section" style={{ marginTop: '8px' }}>
                <p style={{ marginBottom: '12px', fontSize: 'clamp(14px, 2vw, 15px)', fontWeight: '500' }}>🌞 {t('header.theme')}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: 'clamp(13px, 2vw, 14px)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: theme === 'light' ? '#ec4899' : '#e5e7eb',
                      color: theme === 'light' ? '#ffffff' : '#374151'
                    }}
                    onMouseEnter={(e) => {
                      if (theme === 'dark') {
                        e.currentTarget.style.backgroundColor = '#4b5563';
                      } else {
                        e.currentTarget.style.backgroundColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (theme === 'dark') {
                        e.currentTarget.style.backgroundColor = '#374151';
                      } else {
                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                      }
                    }}
                    onClick={() => {
                      setTheme('light');
                      setToast({ message: t('header.themeChanged', { theme: t('header.themeLight') }), type: 'success' });
                    }}
                  >
                    {t('header.themeLight')}
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: 'clamp(13px, 2vw, 14px)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: theme === 'dark' ? '#ec4899' : '#e5e7eb',
                      color: theme === 'dark' ? '#ffffff' : '#374151'
                    }}
                    onMouseEnter={(e) => {
                      if (theme === 'dark') {
                        e.currentTarget.style.backgroundColor = '#4b5563';
                      } else {
                        e.currentTarget.style.backgroundColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (theme === 'dark') {
                        e.currentTarget.style.backgroundColor = '#374151';
                      } else {
                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                      }
                    }}
                    onClick={() => {
                      setTheme('dark');
                      setToast({ message: t('header.themeChanged', { theme: t('header.themeDark') }), type: 'success' });
                    }}
                  >
                    {t('header.themeDark')}
                  </button>
                </div>
              </div>

              {/* 알림 설정 */}
              <div className="settings-section" style={{ marginTop: '8px' }}>
                <p style={{ marginBottom: '12px', fontSize: 'clamp(14px, 2vw, 15px)', fontWeight: '500' }}>🔔 {t('header.notifications')}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2vw, 13px)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: alertMode === 'silent' ? '#ec4899' : '#e5e7eb',
                      color: alertMode === 'silent' ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#374151')
                    }}
                    onMouseEnter={(e) => {
                      if (alertMode !== 'silent') {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (alertMode !== 'silent') {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#e5e7eb';
                      }
                    }}
                    onClick={() => {
                      setAlertMode('silent');
                      setToast({ message: t('header.notificationModeChanged', { mode: t('header.notificationSilent') }), type: 'success' });
                    }}
                  >
                    {t('header.notificationSilent')}
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2vw, 13px)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: alertMode === 'vibrate' ? '#ec4899' : '#e5e7eb',
                      color: alertMode === 'vibrate' ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#374151')
                    }}
                    onMouseEnter={(e) => {
                      if (alertMode !== 'vibrate') {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (alertMode !== 'vibrate') {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#e5e7eb';
                      }
                    }}
                    onClick={() => {
                      setAlertMode('vibrate');
                      triggerAlert('vibrate');
                      setToast({ message: t('header.notificationModeChanged', { mode: t('header.notificationVibrate') }), type: 'success' });
                    }}
                  >
                    {t('header.notificationVibrate')}
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2vw, 13px)',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: alertMode === 'melody' ? '#ec4899' : '#e5e7eb',
                      color: alertMode === 'melody' ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#374151')
                    }}
                    onMouseEnter={(e) => {
                      if (alertMode !== 'melody') {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (alertMode !== 'melody') {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#e5e7eb';
                      }
                    }}
                    onClick={() => {
                      setAlertMode('melody');
                      triggerAlert('melody');
                      setToast({ message: t('header.notificationModeChanged', { mode: t('header.notificationMelody') }), type: 'success' });
                    }}
                  >
                    {t('header.notificationMelody')}
                  </button>
                </div>
                
                {/* 안내 문구 */}
                <div className="alert-description">
                  {t('header.notificationDescription')}
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className="settings-footer">
                <button
                  className="settings-button"
                  style={{
                    backgroundColor: '#2563eb',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    height: '44px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => {
                    handleCloseSettings();
                    navigate('/change-password');
                  }}
                >
                  <span>🔒</span>
                  <span className="settings-button-text">{t('header.changePassword')}</span>
                </button>
                <button
                  className="settings-button logout-button"
                  style={{
                    backgroundColor: '#ec4899',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    height: '44px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#db2777';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ec4899';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => {
                    handleCloseSettings();
                    onLogout();
                  }}
                >
                  <span>🧳</span>
                  <span className="settings-button-text">{t('common.logout')}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

// 오프라인 상태 감지 컴포넌트
const OfflineDetector: React.FC = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log('온라인 상태로 변경됨');
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log('오프라인 상태로 변경됨');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#d32f2f',
      color: 'white',
      padding: '10px',
      textAlign: 'center',
      fontSize: '14px',
      zIndex: 9999,
      fontWeight: 'bold'
    }}>
      {t('offline.noConnection')}
    </div>
  );
};

// 오프라인 오버레이 컴포넌트
const OfflineOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // 초기 상태 확인
    checkOnlineStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '20px'
      }}>
        <h2 style={{ color: '#333', fontSize: '18px', marginBottom: '15px' }}>
          {t('offline.title')}
        </h2>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
          {t('offline.message')}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {t('common.confirm')}
        </button>
      </div>
    </div>
  );
};

// Toast 메시지 컴포넌트
const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#4caf50';
      case 'error': return '#333';
      case 'info': return '#2196f3';
      default: return '#333';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: getBackgroundColor(),
      color: 'white',
      padding: '12px 20px',
      borderRadius: '5px',
      fontSize: '14px',
      zIndex: 10001,
      maxWidth: '300px',
      wordWrap: 'break-word'
    }}>
      {message}
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [alertMode, setAlertMode] = useState<AlertMode>(getAlertMode());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load user and settings from localStorage on app start
  useEffect(() => {
    try {
      // Device ID 초기화 (로그인 없이 내 글 구분용)
      initializeDeviceId();
      
      const savedUser = localStorage.getItem('currentUser');
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      const savedAlertMode = localStorage.getItem('alertMode') as AlertMode;
      
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
      if (savedAlertMode && (savedAlertMode === 'silent' || savedAlertMode === 'vibrate' || savedAlertMode === 'melody')) {
        setAlertMode(savedAlertMode);
      }
    } catch (error) {
      console.error('설정 로드 중 오류:', error);
    }
  }, []);

  // Load lost items from localStorage + server
  const loadLostItems = useCallback(async () => {
    try {
      // ✅ 1. localStorage에서 먼저 가져오기
      let localItems: LostItem[] = [];
      try {
        const stored = localStorage.getItem('lostItems');
        if (stored) {
          localItems = JSON.parse(stored);
          console.log('[App] 로컬 데이터 로드:', localItems.length, '개');
        }
      } catch (e) {
        console.error('[App] 로컬 데이터 로드 실패:', e);
      }
      
      // ✅ 2. 서버에서도 가져오기 (백엔드 연결 시 대비)
      if (currentUser) {
        try {
          const response = await fetch('/api/lost-items');
          if (response.ok) {
            const data = await response.json();
            const serverItems: LostItem[] = data.items.map((item: any) => ({
              id: item.id,
              author_id: item.author_id,
              item_type: item.item_type,
              description: item.description,
              location: item.location,
              lat: item.lat,
              lng: item.lng,
              place_name: item.place_name,
              address: item.address,
              lost_at: item.lost_at,
              created_by_device_id: item.created_by_device_id,
              image_urls: item.image_urls || [],
              comments: item.comments || []
            }));
            
            // 중복 제거 후 합치기
            const allItems = [...localItems, ...serverItems];
            const uniqueItems = allItems.filter((item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
            );
            setLostItems(uniqueItems);
            console.log('[App] 전체 데이터:', uniqueItems.length, '개');
          } else {
            // 서버 실패 시 로컬만 사용
            setLostItems(localItems);
            console.warn('[App] 서버 실패, 로컬만 사용');
          }
        } catch (error) {
          setLostItems(localItems);
          console.error('[App] 서버 로드 오류, 로컬만 사용:', error);
        }
      } else {
        // 로그인 안 했을 때도 로컬 데이터는 표시
        setLostItems(localItems);
        console.log('[App] 로그인 없음, 로컬만 사용:', localItems.length, '개');
      }
    } catch (error) {
      console.error('[App] 전체 로드 오류:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadLostItems();
  }, [loadLostItems]);

  // Save theme and alert mode to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      console.log('테마 설정 저장됨:', theme);
    } catch (error) {
      console.error('테마 설정 저장 실패:', error);
    }
  }, [theme]);

  useEffect(() => {
    try {
      saveAlertMode(alertMode);
      console.log('알림 설정 저장됨:', alertMode);
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
    }
  }, [alertMode]);

  // Apply theme to body
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#111827' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#f9fafb' : '#1f2937';
  }, [theme]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setToast({ message: '로그아웃되었습니다. 로그인 페이지로 이동합니다.', type: 'info' });
  };

  const handleAddItem = async (item: Omit<LostItem, 'id' | 'author_id' | 'comments'>) => {
    try {
      const response = await fetch('/api/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser!.id,
          item_type: item.item_type,
          description: item.description,
          location: item.location,
          image_urls: item.image_urls
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const newItem: LostItem = {
          id: data.item.id,
          author_id: data.item.author_id,
          item_type: data.item.item_type,
          description: data.item.description,
          location: data.item.location,
          image_urls: data.item.image_urls || [],
          comments: []
        };
        setLostItems(prev => [newItem, ...prev]);
        setToast({ message: '분실물이 성공적으로 등록되었습니다!', type: 'success' });
        return true;
      } else {
        console.error('분실물 등록 실패');
        setToast({ message: '분실물 등록에 실패했습니다.', type: 'error' });
        return false;
      }
    } catch (error) {
      console.error('분실물 등록 오류:', error);
      setToast({ message: '분실물 등록에 실패했습니다.', type: 'error' });
      return false;
    }
  };

  const handleAddComment = async (itemId: number, commentText: string) => {
    try {
      const response = await fetch(`/api/lost-items/${itemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          author_id: currentUser!.id,
          text: commentText
        })
      });

      const data = await response.json();
      if (data.success) {
        const newComment: Comment = {
          id: data.comment.id,
          item_id: itemId,
          author_id: data.comment.author_id,
          text: data.comment.text
        };

        setLostItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  comments: [...(item.comments || []), newComment] 
                }
              : item
          )
        );
        setToast({ message: '댓글이 성공적으로 등록되었습니다!', type: 'success' });
        return true;
      }
      setToast({ message: '댓글 등록에 실패했습니다.', type: 'error' });
      return false;
    } catch (error) {
      console.error('댓글 추가 실패:', error);
      setToast({ message: '댓글 등록에 실패했습니다.', type: 'error' });
      return false;
    }
  };

  const handleMarkAsRead = useCallback((itemId: number) => {
    setNotifications(prev => prev.map(notification => 
      notification.itemId === itemId 
        ? { ...notification, read: true }
        : notification
    ));
  }, []);

  const handleDeleteComment = async (itemId: number, commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_id: currentUser!.id })
      });

      const data = await response.json();
      if (data.success) {
        setLostItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  comments: (item.comments || []).filter(comment => comment.id !== commentId) 
                }
              : item
          )
        );
        setToast({ message: '댓글이 성공적으로 삭제되었습니다!', type: 'success' });
        return true;
      }
      setToast({ message: '댓글 삭제에 실패했습니다.', type: 'error' });
      return false;
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      setToast({ message: '댓글 삭제에 실패했습니다.', type: 'error' });
      return false;
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const deviceId = localStorage.getItem('lostfinder_device_id') || '';
      const response = await fetch(`/api/lost-items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId })
      });

      const data = await response.json();
      if (data.success) {
        setLostItems(prevItems => prevItems.filter(item => item.id !== itemId));
        setToast({ message: '분실물이 성공적으로 삭제되었습니다!', type: 'success' });
        return true;
      }
      setToast({ message: data.message || '분실물 삭제에 실패했습니다.', type: 'error' });
      return false;
    } catch (error) {
      console.error('분실물 삭제 실패:', error);
      setToast({ message: '분실물 삭제에 실패했습니다.', type: 'error' });
      return false;
    }
  };

  const handleUpdateItem = async (updatedItem: LostItem) => {
    try {
      const deviceId = localStorage.getItem('lostfinder_device_id') || '';
      const response = await fetch(`/api/lost-items/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: updatedItem.item_type,
          description: updatedItem.description,
          location: updatedItem.location,
          image_urls: updatedItem.image_urls,
          lat: updatedItem.lat,
          lng: updatedItem.lng,
          place_name: updatedItem.place_name,
          address: updatedItem.address,
          lost_at: updatedItem.lost_at,
          device_id: deviceId
        })
      });

      const data = await response.json();
      if (data.success) {
        setLostItems(prevItems => 
          prevItems.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          )
        );
        setToast({ message: '분실물이 성공적으로 수정되었습니다!', type: 'success' });
        return true;
      }
      setToast({ message: data.message || '분실물 수정에 실패했습니다.', type: 'error' });
      return false;
    } catch (error) {
      console.error('분실물 수정 실패:', error);
      setToast({ message: '분실물 수정에 실패했습니다.', type: 'error' });
      return false;
    }
  };

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <div style={{
          minHeight: '100vh',
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937'
        }}>
          <Router>
          <OfflineDetector />
          <OfflineOverlay />
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
          <Header 
            currentUser={currentUser} 
            notifications={notifications} 
            onLogout={handleLogout}
            theme={theme}
            setTheme={setTheme}
            alertMode={alertMode}
            setAlertMode={setAlertMode}
            setToast={setToast}
          />
          
          <main style={{ padding: '1rem' }}>
            <Routes>
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/signup" element={<Navigate to="/" />} />
              <Route path="/register" element={<Navigate to="/" />} />
              <Route path="/forgot-password" element={<Navigate to="/" />} />
              <Route path="/reset-password" element={<Navigate to="/" />} />
              <Route path="/change-password" element={<Navigate to="/" />} />
              <Route path="/success-stories" element={
                <SuccessStoriesPage />
              } />
              <Route path="/admin" element={
                currentUser?.role === 'admin' ? 
                <AdminPanel theme={theme} /> : 
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <h2>접근 권한이 없습니다</h2>
                  <p>관리자만 접근할 수 있습니다.</p>
                </div>
              } />
              <Route path="/" element={
                <MainPage 
                  currentUser={currentUser}
                  lostItems={lostItems}
                  onAddItem={handleAddItem}
                  theme={theme}
                />
              } />
              <Route path="/list" element={
                <ListPage 
                  currentUser={currentUser}
                  onDeleteItem={handleDeleteItem}
                  theme={theme}
                />
              } />
              <Route path="/map" element={
                <MapPage 
                  lostItems={lostItems}
                  currentUser={currentUser}
                />
              } />
              <Route path="/detail/:id" element={
                <DetailPage 
                  currentUser={currentUser}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onDeleteItem={handleDeleteItem}
                  onUpdateItem={handleUpdateItem}
                  onMarkAsRead={handleMarkAsRead}
                  theme={theme}
                />
              } />
              <Route path="/edit/:id" element={
                <EditPage 
                  currentUser={currentUser}
                  onUpdateItem={handleUpdateItem}
                  onAddItem={handleAddItem}
                  theme={theme}
                />
              } />
              <Route path="/map" element={
                <MapPage 
                  lostItems={lostItems}
                  currentUser={currentUser}
                />
              } />
            </Routes>
          </main>
          </Router>
        </div>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
