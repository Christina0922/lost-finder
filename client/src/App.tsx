import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import RegisterPage from './pages/RegisterPage';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import EditPage from './pages/EditPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import { sendVerificationCode, forgotPassword, resetPassword, registerUser, loginUser, verifyCode } from './utils/api';
import { executeAlertMode, cleanupAlertMode } from './utils/sound';
import { initCleanup } from './utils/cleanup';
import './App.css';

// 오류 경계 컴포넌트 추가
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
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>오류가 발생했습니다</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 사용자 정보 타입을 정의합니다.
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isTemporaryPassword?: boolean;
}

// 분실물 아이템 타입에 작성자 ID를 추가합니다.
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

// 헤더 컴포넌트
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
  return (
    <header style={{
      backgroundColor: '#333',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
          LostFinder
        </a>
      </div>
      <nav style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {currentUser ? (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', whiteSpace: 'nowrap', position: 'relative' }}>
            <button 
              onClick={onLogout} 
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              로그아웃
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '0',
                margin: '0',
                outline: 'none'
              }}
            >
              ⚙
            </button>
            {showSettings && (
            <div style={{ 
              position: 'absolute',
              top: '100%',
              right: '0',
              width: '90px',
              padding: '6px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              fontSize: '9px',
              marginTop: '5px',
              zIndex: 1000
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: 1, textAlign: 'center', color: '#333', fontSize: '8px' }}>설정</div>
              <div style={{ marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ marginRight: 4, color: '#333', fontSize: '10px' }}>🌗</span>
                <div style={{ display: 'flex', gap: 2 }}>
                <button 
                  onClick={() => setTheme('light')} 
                  style={{ 
                    fontWeight: theme === 'light' ? 'bold' : 'normal', 
                    padding: '2px 6px',
                      fontSize: '9px',
                    borderRadius: '3px',
                      border: theme === 'light' ? '1px solid #007bff' : '1px solid #ccc',
                    background: theme === 'light' ? '#007bff' : '#ffffff',
                    color: theme === 'light' ? '#ffffff' : '#333333',
                      cursor: 'pointer',
                      minWidth: '35px'
                  }}
                >
                  화이트
                </button>
                <button 
                  onClick={() => setTheme('dark')} 
                  style={{ 
                    fontWeight: theme === 'dark' ? 'bold' : 'normal',
                    padding: '2px 6px',
                      fontSize: '9px',
                    borderRadius: '3px',
                      border: theme === 'dark' ? '1px solid #007bff' : '1px solid #ccc',
                    background: theme === 'dark' ? '#007bff' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#333333',
                      cursor: 'pointer',
                      minWidth: '35px'
                  }}
                >
                    블랙
                </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ marginRight: 3, color: '#333', fontSize: '8px' }}>🔔</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  <label style={{ margin: 0, padding: '1px 2px', fontSize: '8px', display: 'flex', alignItems: 'center' }}>
                    <input type="radio" name="alertMode" checked={alertMode === 'vibrate'} onChange={() => setAlertMode('vibrate')} style={{ width: 8, height: 8, marginRight: 1 }} /> 진동
                  </label>
                  <label style={{ margin: 0, padding: '1px 2px', fontSize: '8px', display: 'flex', alignItems: 'center' }}>
                    <input type="radio" name="alertMode" checked={alertMode === 'melody'} onChange={() => setAlertMode('melody')} style={{ width: 8, height: 8, marginRight: 1 }} /> 멜로디
                  </label>
                  <label style={{ margin: 0, padding: '1px 2px', fontSize: '8px', display: 'flex', alignItems: 'center' }}>
                    <input type="radio" name="alertMode" checked={alertMode === 'silent'} onChange={() => setAlertMode('silent')} style={{ width: 8, height: 8, marginRight: 1 }} /> 무음
                  </label>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: 3, marginTop: 3 }}>
                <Link 
                  to="/change-password" 
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '2px 4px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '2px',
                    fontSize: '8px',
                    textAlign: 'center',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                  🔐 비밀번호 변경
                </Link>
              </div>
            </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>로그인</Link>
            <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>회원가입</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('users');
      return savedUsers ? JSON.parse(savedUsers) : [];
    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse currentUser from localStorage", error);
      return null;
    }
  });

  const [lostItems, setLostItems] = useState<LostItem[]>(() => {
    try {
      const savedItems = localStorage.getItem('lostItems');
      const items = savedItems ? JSON.parse(savedItems) : [];
      
      // 특정 아이템들 삭제 (택배 at 태봉로2길 5, 자전거 at 고려대학교 정경대)
      const filteredItems = items.filter((item: LostItem) => {
        if (item.itemType === '택배' && item.location === '태봉로2길 5') {
          console.log('삭제: 택배 (태봉로2길 5)');
          return false;
        }
        if (item.itemType === '자전거' && item.location === '고려대학교 정경대') {
          console.log('삭제: 자전거 (고려대학교 정경대)');
          return false;
        }
        return true;
      });
      
      // 필터링된 결과가 다르면 localStorage 업데이트
      if (filteredItems.length !== items.length) {
        localStorage.setItem('lostItems', JSON.stringify(filteredItems));
        console.log(`삭제 완료: ${items.length - filteredItems.length}개 아이템 제거됨`);
      }
      
      return filteredItems;
    } catch (error) {
      console.error("localStorage에서 분실물 데이터를 불러오는데 실패했습니다.", error);
      return [];
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      return savedNotifications ? JSON.parse(savedNotifications) : [];
    } catch (error) {
      console.error("Failed to parse notifications from localStorage", error);
      return [];
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const [alertMode, setAlertMode] = useState<'vibrate' | 'melody' | 'silent'>(() => {
    return (localStorage.getItem('alertMode') as 'vibrate' | 'melody' | 'silent') || 'melody';
  });



  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lostItems', JSON.stringify(lostItems));
  }, [lostItems]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('alertMode', alertMode);
  }, [alertMode]);



  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanupAlertMode();
    };
  }, []);

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    console.log('App 컴포넌트 마운트됨');
  }, []);

  // 테스트용 분실물 자동 삭제 코드 제거 - 등록된 분실물이 보이도록 함

  const handleSignup = async (username: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      // 서버에 회원가입 요청
      const result = await registerUser({ username, email, phone, password });
      
      // 성공 시 로컬 상태도 업데이트
      const newUser: User = { 
        id: result.user.id, 
        username: result.user.username,
        email: result.user.email, 
        password: password, 
        phoneNumber: result.user.phone 
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      
      alert('회원가입 성공! 바로 로그인됩니다.');
      return true;
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      alert(error.message || '회원가입에 실패했습니다.');
      return false;
    }
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // 서버에 로그인 요청 (이메일을 username으로 전달)
      const result = await loginUser({ username: email, password });
      
      // 성공 시 로컬 상태 업데이트
      const user: User = { 
        id: result.user.id, 
        username: result.user.username,
        email: result.user.email, 
        password: password, 
        phoneNumber: result.user.phone 
      };
      setCurrentUser(user);
      
      // 임시 비밀번호 사용자인 경우 비밀번호 변경 페이지로 리디렉션
      if (user.isTemporaryPassword) {
        setTimeout(() => {
          window.location.href = '/change-password';
        }, 100);
      }
      
      return true;
    } catch (error: any) {
      console.error('로그인 오류:', error);
      alert(error.message || '로그인에 실패했습니다.');
      return false;
    }
  };

  const handleSendVerificationCode = async (phone: string): Promise<boolean> => {
    if (!phone) {
      alert("휴대폰 번호를 입력해주세요.");
      return false;
    }

    try {
      // 먼저 전화번호가 등록된 사용자인지 확인
      await forgotPassword(phone);
      
      // 인증번호 발송
      const result = await sendVerificationCode(phone);
      
      // 서버에서 보내는 상세한 메시지를 표시
      if (result && result.message) {
        alert(result.message);
      } else {
        alert("인증번호 6자리를 발송했습니다!");
      }
      return true;
    } catch (error: any) {
      console.error('인증번호 발송 오류:', error);
      if (error.message.includes('등록되지 않은 전화번호')) {
        alert("등록되지 않은 전화번호입니다. 먼저 회원가입을 해주세요.");
      } else {
        alert("인증번호 발송에 실패했습니다: " + error.message);
      }
      return false;
    }
  };

  const handleVerifyAndResetPassword = async (phone: string, code: string): Promise<string | null> => {
    try {
      // 서버에 인증번호 검증 요청
      await verifyCode(phone, code);

      // 인증 성공 시 임시 비밀번호 발급
      const newTempPassword = Math.random().toString(36).slice(-8);
      await resetPassword(phone, newTempPassword);

      alert("비밀번호가 성공적으로 재설정되었습니다.");
      return newTempPassword;
    } catch (error: any) {
      alert(error.message || "인증번호가 올바르지 않습니다.");
      return null;
    }
  };

  const handleChangePassword = (newPassword: string): boolean => {
    if (!currentUser) return false;
    
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === currentUser.id 
          ? { ...user, password: newPassword, isTemporaryPassword: false }
          : user
      )
    );
    
    // 현재 사용자 정보도 업데이트
    setCurrentUser(prev => prev ? { ...prev, password: newPassword, isTemporaryPassword: false } : null);
    
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    window.location.href = '/'; // 메인 페이지로 리디렉션
  };
  
  const handleAddItem = (item: Omit<LostItem, 'id' | 'authorId' | 'comments'>) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    const newItem: LostItem = { ...item, id: Date.now(), authorId: currentUser.id, comments: [] };
    setLostItems(prevItems => [...prevItems, newItem]);
  };

  const handleAddComment = (itemId: number, commentText: string) => {
    if (!currentUser) return;
    
    const newComment: Comment = { id: Date.now(), authorId: currentUser.id, text: commentText };
    let itemAuthorId: number | null = null;
    let itemType: string = '';

    const updatedItems = lostItems.map(item => {
        if (item.id === itemId) {
            itemAuthorId = item.authorId;
            itemType = item.itemType;
            return { ...item, comments: [...item.comments, newComment] };
        }
        return item;
    });
    setLostItems(updatedItems);

    if (itemAuthorId && itemAuthorId !== currentUser.id) {
        const newNotification: Notification = {
            id: Date.now() + 1,
            userId: itemAuthorId,
            itemId: itemId,
            message: `'${itemType}' 게시물에 새 댓글이 달렸습니다.`,
            read: false,
        };
        setNotifications(prev => [...prev, newNotification]);
        
        // 알림 발생 시 선택된 모드에 따라 동작 실행
        executeAlertMode(alertMode);
    }
  };

  const handleMarkAsRead = (itemId: number) => {
    if (!currentUser) return;

    setNotifications(prev =>
      prev.map(n =>
        n.itemId === itemId && n.userId === currentUser.id ? { ...n, read: true } : n
      )
    );
  };

  const handleDeleteComment = (itemId: number, commentId: number) => {
    setLostItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            comments: item.comments.filter(comment => comment.id !== commentId),
          };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (itemId: number) => {
    setLostItems(prevItems => prevItems.filter(item => item.id !== itemId));
    // 관련 알림도 삭제할 수 있습니다 (선택 사항)
    setNotifications(prev => prev.filter(n => n.itemId !== itemId));
  };

  const handleUpdateItem = (updatedItem: LostItem) => {
    setLostItems(prevItems =>
      prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  return (
    <ErrorBoundary>
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
        <main className="app-main">
          <Routes>
            <Route path="/" element={<MainPage currentUser={currentUser} />} />
            <Route path="/register" element={<RegisterPage onAddItem={handleAddItem} currentUser={currentUser} />} />
            <Route
              path="/list"
              element={<ListPage items={lostItems} currentUser={currentUser} onDeleteItem={handleDeleteItem} />}
            />
            <Route
              path="/detail/:id"
              element={<DetailPage items={lostItems} users={users} currentUser={currentUser} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onMarkAsRead={handleMarkAsRead} onDeleteItem={handleDeleteItem} />}
            />
            <Route
              path="/edit/:id"
              element={<EditPage items={lostItems} currentUser={currentUser} onUpdateItem={handleUpdateItem} />}
            />
            <Route path="/signup" element={<SignupPage onSignup={handleSignup} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route
              path="/forgot-password"
              element={
                <ForgotPasswordPage 
                  onSendVerificationCode={handleSendVerificationCode}
                  onResetPasswordByPhone={handleVerifyAndResetPassword} 
                />
              }
            />
            <Route
              path="/change-password"
              element={<ChangePasswordPage currentUser={currentUser} onChangePassword={handleChangePassword} />}
            />
            <Route
              path="/success-stories"
              element={<SuccessStoriesPage />}
            />
          </Routes>
        </main>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
