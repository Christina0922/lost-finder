import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';
import EditPage from './pages/EditPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import AdminPanel from './pages/AdminPanel';
import { AlertMode, getAlertMode, setAlertMode, triggerAlert } from './utils/notification';
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

// Type definitions
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isTemporaryPassword?: boolean;
  role?: 'user' | 'admin';
}

export interface Comment { 
  id: number; 
  author_id: number; 
  author_name?: string;
  author_email?: string;
  text: string; 
  created_at?: string;
}

export interface LostItem {
  id: number;
  author_id: number;
  author_name?: string;
  author_email?: string;
  item_type: string;
  description: string;
  location: string;
  image_urls: string[];
  created_at?: string;
  updated_at?: string;
  comments?: Comment[];
}

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
  const [showSettings, setShowSettings] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        {currentUser ? (
          <>
            <span style={{ fontSize: '0.9rem' }}>
              안녕하세요, {currentUser.username}님!
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
        ) : (
          <>
            <Link to="/login" style={{
              textDecoration: 'none',
              color: theme === 'dark' ? '#f9fafb' : '#1f2937',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}>
              로그인
            </Link>
            <Link to="/signup" style={{
              textDecoration: 'none',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}>
              회원가입
            </Link>
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
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>설정</span>
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

              {/* 테마 */}
              <div className="settings-section" style={{ marginTop: '8px' }}>
                <p style={{ marginBottom: '12px', fontSize: 'clamp(14px, 2vw, 15px)', fontWeight: '500' }}>🌞 테마</p>
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
                      setToast({ message: '화이트 테마로 변경되었습니다.', type: 'success' });
                    }}
                  >
                    화이트
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
                      setToast({ message: '다크 테마로 변경되었습니다.', type: 'success' });
                    }}
                  >
                    다크
                  </button>
                </div>
              </div>

              {/* 알림 설정 */}
              <div className="settings-section" style={{ marginTop: '8px' }}>
                <p style={{ marginBottom: '12px', fontSize: 'clamp(14px, 2vw, 15px)', fontWeight: '500' }}>🔔 알림</p>
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
                      setToast({ message: '알림 모드가 무음으로 설정되었습니다.', type: 'success' });
                    }}
                  >
                    무음
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
                      setToast({ message: '알림 모드가 진동으로 설정되었습니다.', type: 'success' });
                    }}
                  >
                    진동
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
                      setToast({ message: '알림 모드가 멜로디로 설정되었습니다.', type: 'success' });
                    }}
                  >
                    멜로디
                  </button>
                </div>
                
                {/* 안내 문구 */}
                <div className="alert-description">
                  ※ 이 설정은 LostFinder 앱 내 알림에만 적용됩니다. 휴대폰 전체의 무음/진동/벨소리 설정은 변경되지 않습니다.
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
                  <span className="settings-button-text">비밀번호 변경</span>
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
                  <span className="settings-button-text">로그아웃</span>
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
      현재 인터넷이 연결되지 않았습니다.
    </div>
  );
};

// 오프라인 오버레이 컴포넌트
const OfflineOverlay: React.FC = () => {
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
          인터넷 연결이 필요합니다
        </h2>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
          Wi-Fi 또는 데이터를 켜 주세요.
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
          확인
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

  // Load lost items from server when user is logged in
  const loadLostItems = useCallback(async () => {
    if (currentUser) {
      try {
        const response = await fetch('/api/lost-items');
        if (response.ok) {
          const data = await response.json();
          const items: LostItem[] = data.items.map((item: any) => ({
            id: item.id,
            author_id: item.author_id,
            item_type: item.item_type,
            description: item.description,
            location: item.location,
            image_urls: item.image_urls || [],
            comments: item.comments || []
          }));
          setLostItems(items);
        } else {
          console.error('분실물 목록 로드 실패');
        }
      } catch (error) {
        console.error('분실물 목록 로드 오류:', error);
      }
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
      localStorage.setItem('alertMode', alertMode);
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

  const handleSignup = async (username: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, phone, password })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return true;
      } else {
        alert(data.error || '회원가입에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('서버 연결에 실패했습니다.');
      return false;
    }
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return true;
      } else {
        alert(data.error || '로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('서버 연결에 실패했습니다.');
      return false;
    }
  };

  const handleSendVerificationCode = async (phone: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (response.ok) {
        alert('인증번호가 전송되었습니다.');
        return true;
      } else {
        const error = await response.json();
        alert(error.message || '인증번호 전송에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Send verification code error:', error);
      alert('서버 연결에 실패했습니다.');
      return false;
    }
  };

  const handleVerifyAndResetPassword = async (phone: string, code: string): Promise<string | null> => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/verify-and-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`임시 비밀번호가 생성되었습니다: ${result.tempPassword}`);
        return result.tempPassword;
      } else {
        const error = await response.json();
        alert(error.message || '인증에 실패했습니다.');
        return null;
      }
    } catch (error) {
      console.error('Verify and reset password error:', error);
      alert('서버 연결에 실패했습니다.');
      return null;
    }
  };

  const handleRequestPasswordResetByEmail = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        alert('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
        return true;
      } else {
        const error = await response.json();
        alert(error.message || '비밀번호 재설정 요청에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Request password reset error:', error);
      alert('서버 연결에 실패했습니다.');
      return false;
    }
  };

  const handleRequestPasswordResetBySMS = async (phone: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/request-password-reset-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (response.ok) {
        alert('비밀번호 재설정 SMS가 발송되었습니다.');
        return true;
      } else {
        const error = await response.json();
        alert(error.message || 'SMS 비밀번호 재설정 요청에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Request SMS password reset error:', error);
      alert('서버 연결에 실패했습니다.');
      return false;
    }
  };

  const handleChangePassword = (newPassword: string): boolean => {
    if (!currentUser) return false;
    
    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    alert('비밀번호가 변경되었습니다.');
    return true;
  };

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
        const newComment = {
          id: data.comment.id,
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
      const response = await fetch(`/api/lost-items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setLostItems(prevItems => prevItems.filter(item => item.id !== itemId));
        setToast({ message: '분실물이 성공적으로 삭제되었습니다!', type: 'success' });
        return true;
      }
      setToast({ message: '분실물 삭제에 실패했습니다.', type: 'error' });
      return false;
    } catch (error) {
      console.error('분실물 삭제 실패:', error);
      setToast({ message: '분실물 삭제에 실패했습니다.', type: 'error' });
      return false;
    }
  };

  const handleUpdateItem = async (updatedItem: LostItem) => {
    try {
      const response = await fetch(`/api/lost-items/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: updatedItem.item_type,
          description: updatedItem.description,
          location: updatedItem.location,
          image_urls: updatedItem.image_urls
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
      setToast({ message: '분실물 수정에 실패했습니다.', type: 'error' });
      return false;
    } catch (error) {
      console.error('분실물 수정 실패:', error);
      setToast({ message: '분실물 수정에 실패했습니다.', type: 'error' });
      return false;
    }
  };

  // 에러 처리 함수
  const handleError = (error: any, context: string) => {
    console.error(`${context} 오류:`, error);
    
    let message = '서버와의 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.';
    
    if (error.response?.status === 404) {
      message = '요청하신 정보를 찾을 수 없습니다.';
    } else if (error.response?.status === 500) {
      message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    } else if (error.code === 'NETWORK_ERROR') {
      message = '네트워크 연결을 확인해 주세요.';
    }
    
    // Toast 메시지 표시
    setToast({ message, type: 'error' });
    
    // 추가로 alert도 표시 (중요한 작업의 경우)
    if (context.includes('등록') || context.includes('수정') || context.includes('삭제')) {
      alert(message);
    }
  };

  // API 호출 래퍼 함수
  const safeApiCall = async (apiFunction: () => Promise<any>, context: string) => {
    try {
      return await apiFunction();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  };

  return (
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
              <Route path="/login" element={
                currentUser ? <Navigate to="/" /> : 
                <LoginPage onLogin={handleLogin} theme={theme} />
              } />
              <Route path="/signup" element={
                currentUser ? <Navigate to="/" /> : 
                <SignupPage onSignup={handleSignup} theme={theme} />
              } />
              <Route path="/forgot-password" element={
                currentUser ? <Navigate to="/" /> : 
                <ForgotPasswordPage 
                  onSendVerificationCode={handleSendVerificationCode}
                  onVerifyAndResetPassword={handleVerifyAndResetPassword}
                  onRequestPasswordResetByEmail={handleRequestPasswordResetByEmail}
                  onRequestPasswordResetBySMS={handleRequestPasswordResetBySMS}
                  theme={theme}
                />
              } />
              <Route path="/reset-password" element={
                currentUser ? <Navigate to="/" /> : 
                <ResetPasswordPage onPasswordReset={handleChangePassword} theme={theme} />
              } />
              <Route path="/change-password" element={
                currentUser ? 
                <ChangePasswordPage currentUser={currentUser} onChangePassword={handleChangePassword} /> : 
                <Navigate to="/login" />
              } />
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
                currentUser ? 
                <ListPage 
                  currentUser={currentUser}
                  onDeleteItem={handleDeleteItem}
                  theme={theme}
                /> : 
                <Navigate to="/login" />
              } />
              <Route path="/detail/:id" element={
                currentUser ? 
                <DetailPage 
                  currentUser={currentUser}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onDeleteItem={handleDeleteItem}
                  onUpdateItem={handleUpdateItem}
                  onMarkAsRead={handleMarkAsRead}
                  theme={theme}
                /> : 
                <Navigate to="/login" />
              } />
              <Route path="/edit/:id" element={
                currentUser ? 
                <EditPage 
                  currentUser={currentUser}
                  onUpdateItem={handleUpdateItem}
                  onAddItem={handleAddItem}
                  theme={theme}
                /> : 
                <Navigate to="/login" />
              } />
            </Routes>
          </main>
        </Router>
      </div>
    </ErrorBoundary>
  );
};

export default App;
