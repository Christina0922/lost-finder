import React, { useState, useEffect, useRef } from 'react';
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

export interface Comment { id: number; authorId: number; text: string; }

export interface LostItem {
  id: number;
  authorId: number;
  itemType: string;
  description: string;
  location: string;
  imageUrls: string[];
  comments: Comment[];
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
  alertMode: 'vibrate' | 'melody' | 'silent';
  setAlertMode: (m: 'vibrate' | 'melody' | 'silent') => void;
}> = ({ currentUser, notifications, onLogout, theme, setTheme, alertMode, setAlertMode }) => {
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
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
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
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: 'min(300px, 85vw)',
                maxHeight: 'min(500px, 80vh)',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 1000,
                transition: 'all 0.2s ease-in-out',
                transform: isAnimating ? 'translateX(-100%)' : 'translateX(0)',
                backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                boxShadow: theme === 'dark' 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* 타이틀 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>설정</span>
                <button 
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: theme === 'dark' ? '#f9fafb' : '#1f2937'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#e5e7eb';
                  }}
                  onClick={handleCloseSettings}
                >
                  ✕
                </button>
              </div>

              {/* 테마 */}
              <div>
                <p style={{ marginBottom: '4px', fontSize: '14px' }}>🌞 테마</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
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
                    onClick={() => setTheme('light')}
                  >
                    화이트
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
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
                    onClick={() => setTheme('dark')}
                  >
                    다크
                  </button>
                </div>
              </div>

              {/* 알림 */}
              <div>
                <p style={{ marginBottom: '4px', fontSize: '14px' }}>🔔 알림</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: alertMode === 'vibrate' ? '#ec4899' : '#e5e7eb',
                      color: alertMode === 'vibrate' ? '#ffffff' : '#374151'
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
                    onClick={() => setAlertMode('vibrate')}
                  >
                    진동
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: alertMode === 'melody' ? '#ec4899' : '#e5e7eb',
                      color: alertMode === 'melody' ? '#ffffff' : '#374151'
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
                    onClick={() => setAlertMode('melody')}
                  >
                    멜로디
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: alertMode === 'silent' ? '#ec4899' : '#e5e7eb',
                      color: alertMode === 'silent' ? '#ffffff' : '#374151'
                    }}
                    onMouseEnter={(e) => {
                      if (alertMode !== 'silent') {
                        if (theme === 'dark') {
                          e.currentTarget.style.backgroundColor = '#4b5563';
                        } else {
                          e.currentTarget.style.backgroundColor = '#d1d5db';
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (alertMode !== 'silent') {
                        if (theme === 'dark') {
                          e.currentTarget.style.backgroundColor = '#374151';
                        } else {
                          e.currentTarget.style.backgroundColor = '#e5e7eb';
                        }
                      }
                    }}
                    onClick={() => setAlertMode('silent')}
                  >
                    무음
                  </button>
                </div>
              </div>



              {/* 하단 버튼 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  style={{
                    backgroundColor: '#2563eb',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: '100%',
                    height: '36px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                  onClick={() => {
                    handleCloseSettings();
                    navigate('/change-password');
                  }}
                >
                  🔒 비밀번호 변경
                </button>
                <button
                  style={{
                    backgroundColor: '#ec4899',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: '100%',
                    height: '36px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#db2777';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ec4899';
                  }}
                  onClick={() => {
                    handleCloseSettings();
                    onLogout();
                  }}
                >
                  🧳 로그아웃
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [alertMode, setAlertMode] = useState<'vibrate' | 'melody' | 'silent'>('vibrate');

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const savedAlertMode = localStorage.getItem('alertMode') as 'vibrate' | 'melody' | 'silent';
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedAlertMode) {
      setAlertMode(savedAlertMode);
    }
  }, []);

  // Save theme and alert mode to localStorage when they change
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('alertMode', alertMode);
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
  };

  const handleAddItem = (item: Omit<LostItem, 'id' | 'authorId' | 'comments'>) => {
    const newItem: LostItem = {
      ...item,
      id: Date.now(),
      authorId: currentUser!.id,
      comments: []
    };
    setLostItems(prev => [...prev, newItem]);
  };

  const handleAddComment = (itemId: number, commentText: string) => {
    setLostItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, comments: [...item.comments, { id: Date.now(), authorId: currentUser!.id, text: commentText }] }
        : item
    ));
  };

  const handleMarkAsRead = (itemId: number) => {
    setNotifications(prev => prev.map(notification => 
      notification.itemId === itemId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const handleDeleteComment = (itemId: number, commentId: number) => {
    setLostItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, comments: item.comments.filter(comment => comment.id !== commentId) }
        : item
    ));
  };

  const handleDeleteItem = (itemId: number) => {
    setLostItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateItem = (updatedItem: LostItem) => {
    setLostItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  return (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937'
      }}>
        <Router>
          <Header 
            currentUser={currentUser} 
            notifications={notifications} 
            onLogout={handleLogout}
            theme={theme}
            setTheme={setTheme}
            alertMode={alertMode}
            setAlertMode={setAlertMode}
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
                  lostItems={lostItems}
                  currentUser={currentUser}
                  onDeleteItem={handleDeleteItem}
                  theme={theme}
                /> : 
                <Navigate to="/login" />
              } />
              <Route path="/item/:id" element={
                currentUser ? 
                <DetailPage 
                  lostItems={lostItems}
                  currentUser={currentUser}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onMarkAsRead={handleMarkAsRead}
                  theme={theme}
                /> : 
                <Navigate to="/login" />
              } />
              <Route path="/edit/:id" element={
                currentUser ? 
                <EditPage 
                  lostItems={lostItems}
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
