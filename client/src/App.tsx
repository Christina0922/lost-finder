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
import { checkServerHealth, sendVerificationCode } from './utils/api';
import './App.css';

// 사용자 정보 타입을 정의합니다.
export interface User {
  id: number;
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read && n.userId === currentUser?.id);

  const handleNotificationClick = (itemId: number) => {
    window.location.href = `/detail/${itemId}`;
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <a href="/" className="logo">LostFinder</a>
      </div>
      <nav className="header-right">
        {currentUser ? (
          <div className="user-nav">
            {currentUser.isTemporaryPassword && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: '4px', 
                padding: '8px 12px', 
                marginRight: '16px',
                fontSize: '14px',
                color: '#856404'
              }}>
                <Link to="/change-password" style={{ color: '#856404', textDecoration: 'none' }}>
                  🔒 비밀번호 변경 필요
                </Link>
              </div>
            )}
            <div className="notification-container">
              <button onClick={() => setShowNotifications(!showNotifications)} className="notification-bell">
                🔔 
                {unreadNotifications.length > 0 && 
                  <span className="notification-count">{unreadNotifications.length}</span>
                }
              </button>
              {showNotifications && (
                <div className="notification-dropdown">
                  {unreadNotifications.length > 0 ? (
                    <ul>
                      {unreadNotifications.map(n => (
                        <li key={n.id} onClick={() => handleNotificationClick(n.itemId)}>
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="no-notifications">새로운 알림이 없습니다.</div>
                  )}
                </div>
              )}
            </div>
            <button onClick={onLogout} className="logout-button">로그아웃</button>
            <div className="settings-container" style={{ position: 'relative', display: 'inline-block' }}>
              <button className="settings-gear" onClick={() => setShowSettings(v => !v)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', marginRight: 0 }} title="설정">
                ⚙️
              </button>
              {showSettings && (
                <div className="settings-dropdown" style={{ position: 'absolute', right: 0, top: 36, background: '#fff', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 220, zIndex: 1000, padding: 16 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>설정</div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ marginRight: 8 }}>🌗 테마:</span>
                    <button onClick={() => setTheme('light')} style={{ fontWeight: theme === 'light' ? 'bold' : 'normal', marginRight: 4 }}>화이트</button>
                    <button onClick={() => setTheme('dark')} style={{ fontWeight: theme === 'dark' ? 'bold' : 'normal' }}>다크</button>
                  </div>
                  <div>
                    <span style={{ marginRight: 8 }}>🔔 알림:</span>
                    <div className="alert-modes">
                      <label>
                        <input type="radio" name="alertMode" checked={alertMode === 'vibrate'} onChange={() => setAlertMode('vibrate')} /> 진동
                      </label>
                      <label>
                        <input type="radio" name="alertMode" checked={alertMode === 'melody'} onChange={() => setAlertMode('melody')} /> 멜로디
                      </label>
                      <label>
                        <input type="radio" name="alertMode" checked={alertMode === 'silent'} onChange={() => setAlertMode('silent')} /> 무음
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="guest-nav">
            <Link to="/login" className="nav-link">로그인</Link>
            <Link to="/signup" className="nav-link">회원가입</Link>
            <div className="settings-container" style={{ position: 'relative', display: 'inline-block' }}>
              <button className="settings-gear" onClick={() => setShowSettings(v => !v)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', marginRight: 0 }} title="설정">
                ⚙️
              </button>
              {showSettings && (
                <div className="settings-dropdown" style={{ position: 'absolute', right: 0, top: 36, background: '#fff', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 220, zIndex: 1000, padding: 16 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>설정</div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ marginRight: 8 }}>🌗 테마:</span>
                    <button onClick={() => setTheme('light')} style={{ fontWeight: theme === 'light' ? 'bold' : 'normal', marginRight: 4 }}>화이트</button>
                    <button onClick={() => setTheme('dark')} style={{ fontWeight: theme === 'dark' ? 'bold' : 'normal' }}>다크</button>
                  </div>
                  <div>
                    <span style={{ marginRight: 8 }}>🔔 알림:</span>
                    <div className="alert-modes">
                      <label>
                        <input type="radio" name="alertMode" checked={alertMode === 'vibrate'} onChange={() => setAlertMode('vibrate')} /> 진동
                      </label>
                      <label>
                        <input type="radio" name="alertMode" checked={alertMode === 'melody'} onChange={() => setAlertMode('melody')} /> 멜로디
                      </label>
                      <label>
                        <input type="radio" name="alertMode" checked={alertMode === 'silent'} onChange={() => setAlertMode('silent')} /> 무음
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
      return savedItems ? JSON.parse(savedItems) : [];
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

  const [verificationCodes, setVerificationCodes] = useState<{ [phone: string]: string }>({});

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

  const handleSignup = (email: string, pass: string, phone: string): boolean => {
    if (users.find(u => u.email === email)) {
      alert('이미 가입된 이메일입니다.');
      return false;
    }
    const newUser: User = { id: Date.now(), email, password: pass, phoneNumber: phone };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    alert('회원가입 성공! 바로 로그인됩니다.');
    return true;
  };

  const handleLogin = (email: string, pass: string): boolean => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      
      // 임시 비밀번호 사용자인 경우 비밀번호 변경 페이지로 리디렉션
      if (user.isTemporaryPassword) {
        setTimeout(() => {
          window.location.href = '/change-password';
        }, 100);
      }
      
      return true;
    }
    return false;
  };

  const handleSendVerificationCode = async (phone: string): Promise<boolean> => {
    if (!phone) {
      alert("휴대폰 번호를 입력해주세요.");
      return false;
    }

    try {
      await sendVerificationCode(phone);
      alert("인증번호가 발송되었습니다. (개발 모드에서는 콘솔 확인)");
      return true;
    } catch (error) {
      console.error(error);
      alert("인증번호 발송에 실패했습니다.");
      return false;
    }
  };

  const handleVerifyAndResetPassword = (phone: string, code: string): string | null => {
    const storedCode = verificationCodes[phone];
    const userToReset = users.find(user => user.phoneNumber === phone);

    if (userToReset && storedCode && storedCode === code) {
      const newTempPassword = Math.random().toString(36).slice(-8);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userToReset.id ? { ...user, password: newTempPassword, isTemporaryPassword: true } : user
        )
      );
      // 코드를 사용한 후에는 즉시 무효화합니다.
      setVerificationCodes(prev => {
          const newCodes = {...prev};
          delete newCodes[phone];
          return newCodes;
      });
      return newTempPassword;
    }
    return null;
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
        </Routes>
      </main>
    </Router>
  );
}

export default App;
