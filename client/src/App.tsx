import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";

import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import DetailPage from "./pages/DetailPage";
import ListPage from "./pages/ListPage";
import MapPage from "./pages/MapPage";
import EditPage from "./pages/EditPage";
import SuccessStoriesPage from "./pages/SuccessStoriesPage";

export type ThemeMode = "light" | "dark";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LostItem {
  id: string;
  title: string;
  description?: string;
  locationText?: string;
  lat?: number;
  lng?: number;
  createdAt?: string;
  ownerId?: string;
}

// ✅ 로그인/회원가입에서 공통으로 쓰는 타입(통일)
export type AuthLoginHandler = (email: string, password: string) => Promise<boolean>;

const STORAGE_KEY_USER = "lostfinder_current_user";
const STORAGE_KEY_THEME = "lostfinder_theme";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function isAppAssetsHost(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const isAppAssets = hostname === "appassets.androidplatform.net" || pathname.includes('/assets/');
  console.log('isAppAssetsHost 체크:', { hostname, pathname, isAppAssets });
  return isAppAssets;
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved === "dark" ? "dark" : "light";
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return safeJsonParse<User>(localStorage.getItem(STORAGE_KEY_USER));
  });

  const [lostItems, setLostItems] = useState<LostItem[]>([]);

  const isLoggedIn = useMemo(() => !!currentUser, [currentUser]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // ✅ LoginPage/RegisterPage가 동일하게 요구하는 시그니처로 통일
  const onLogin: AuthLoginHandler = async (email, password) => {
    if (!email || !password) return false;

    const user: User = {
      id: "local-user",
      email,
      name: email.split("@")[0] || "user",
    };

    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return true;
  };

  const onLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const onAddItem = (item: LostItem) => {
    setLostItems((prev) => [item, ...prev]);
  };

  // ForgotPasswordPage 핸들러들
  const onVerifyAndResetPassword = async (phone: string, code: string): Promise<string | null> => {
    console.log('비밀번호 재설정 확인:', phone, code);
    // 실제 구현은 나중에 추가
    return null;
  };

  const onSendVerificationCode = async (phone: string): Promise<boolean> => {
    console.log('인증 코드 전송:', phone);
    // 실제 구현은 나중에 추가
    return true;
  };

  const onRequestPasswordResetByEmail = async (email: string): Promise<boolean> => {
    console.log('이메일로 비밀번호 재설정 요청:', email);
    // 실제 구현은 나중에 추가
    return true;
  };

  const onRequestPasswordResetBySMS = async (phone: string): Promise<boolean> => {
    console.log('SMS로 비밀번호 재설정 요청:', phone);
    // 실제 구현은 나중에 추가
    return true;
  };

  // ChangePasswordPage 핸들러
  const onChangePassword = (newPassword: string): boolean => {
    console.log('비밀번호 변경:', newPassword);
    // 실제 구현은 나중에 추가
    return true;
  };

  // ListPage 핸들러
  const onDeleteItem = (itemId: number) => {
    setLostItems((prev) => prev.filter(item => Number(item.id) !== itemId));
  };

  // DetailPage 핸들러들
  const onAddComment = (itemId: number, commentText: string) => {
    console.log('댓글 추가:', itemId, commentText);
    // 실제 구현은 나중에 추가
  };

  const onDeleteComment = (itemId: number, commentId: number) => {
    console.log('댓글 삭제:', itemId, commentId);
    // 실제 구현은 나중에 추가
  };

  const onUpdateItem = (updatedItem: any) => {
    // types/index.ts의 LostItem을 App.tsx의 LostItem으로 변환
    const convertedItem: LostItem = {
      id: String(updatedItem.id),
      title: updatedItem.item_type || updatedItem.description || '',
      description: updatedItem.description,
      locationText: updatedItem.location || updatedItem.address,
      lat: updatedItem.lat,
      lng: updatedItem.lng,
      createdAt: updatedItem.created_at,
      ownerId: String(updatedItem.author_id)
    };
    setLostItems((prev) => prev.map(item => item.id === convertedItem.id ? convertedItem : item));
  };

  const onMarkAsRead = (itemId: number) => {
    console.log('읽음 처리:', itemId);
    // 실제 구현은 나중에 추가
  };

  // ✅ Router 설정 - basename 문제 해결
  const Router: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAppAssets = isAppAssetsHost();
    console.log('Router 선택:', isAppAssets ? 'BrowserRouter (appassets)' : 'BrowserRouter (localhost)', 'hostname:', typeof window !== 'undefined' ? window.location.hostname : 'undefined');
    
    try {
      // localhost에서는 basename을 빈 문자열로 설정 (basename="."는 문제를 일으킴)
      // Android assets에서는 basename을 "/assets"로 설정 (실제 경로에 맞게)
      const basename = isAppAssets ? "/assets" : "";
      console.log('Router basename:', basename, 'pathname:', typeof window !== 'undefined' ? window.location.pathname : 'undefined');
      return <BrowserRouter basename={basename}>{children}</BrowserRouter>;
    } catch (error) {
      console.error('❌ Router 생성 에러:', error);
      // 에러 발생 시 기본 BrowserRouter 사용 (basename 없음)
      return <BrowserRouter>{children}</BrowserRouter>;
    }
  };

  try {
  return (
      <ErrorBoundary>
          <Router>
            <Routes>
        <Route
          path="/"
          element={
                <MainPage 
                  currentUser={currentUser}
                  lostItems={lostItems}
              onAddItem={onAddItem}
                  theme={theme}
                />
          }
        />

        <Route
          path="/map"
          element={
            <MapPage 
              lostItems={lostItems}
              currentUser={currentUser}
            />
          }
        />

        <Route
          path="/edit/new"
          element={
            <EditPage 
              currentUser={currentUser}
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              theme={theme}
            />
          }
        />

        <Route
          path="/edit/:id"
          element={
            <EditPage 
              currentUser={currentUser}
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              theme={theme}
            />
          }
        />

        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLogin={onLogin} theme={theme} />
            )
          }
        />

        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterPage onLogin={onLogin} theme={theme} />
            )
          }
        />

        <Route 
          path="/forgot-password" 
          element={
            <ForgotPasswordPage 
                  theme={theme}
              onVerifyAndResetPassword={onVerifyAndResetPassword}
              onSendVerificationCode={onSendVerificationCode}
              onRequestPasswordResetByEmail={onRequestPasswordResetByEmail}
              onRequestPasswordResetBySMS={onRequestPasswordResetBySMS}
            />
          } 
        />
        <Route 
          path="/change-password" 
          element={
            <ChangePasswordPage 
                  currentUser={currentUser}
              onChangePassword={onChangePassword}
            />
          } 
        />
        <Route 
          path="/list" 
          element={
            <ListPage 
              currentUser={currentUser ? {
                id: Number(currentUser.id) || 0,
                username: currentUser.name || currentUser.email.split('@')[0] || 'user',
                email: currentUser.email,
                password: ''
              } : null} 
              onDeleteItem={onDeleteItem} 
                  theme={theme}
                />
          } 
        />

        <Route 
          path="/detail/:id" 
          element={
            <DetailPage 
              currentUser={currentUser ? {
                id: Number(currentUser.id) || 0,
                username: currentUser.name || currentUser.email.split('@')[0] || 'user',
                email: currentUser.email,
                password: ''
              } : null} 
                  theme={theme}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onDeleteItem={onDeleteItem}
              onUpdateItem={onUpdateItem}
              onMarkAsRead={onMarkAsRead}
            />
          } 
        />

        <Route path="/logout" element={<LogoutGate onLogout={onLogout} afterPath="/" />} />

        {/* 후기 페이지 */}
        <Route 
          path="/success-stories" 
          element={<SuccessStoriesPage />} 
        />
        
        {/* 퍼즐 게임은 외부 링크로 처리되므로 라우트 불필요 */}

        <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

          <ThemeFloatingButton theme={theme} setTheme={setTheme} />
          </Router>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ App 컴포넌트 렌더링 에러:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#333', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#667eea', fontSize: '24px', marginBottom: '16px' }}>오류가 발생했습니다</h2>
        <p style={{ marginBottom: '20px', fontSize: '16px' }}>{error instanceof Error ? error.message : '알 수 없는 오류'}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '12px 24px', 
            background: '#667eea', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          새로고침
        </button>
      </div>
    );
  }
}

function LogoutGate({ onLogout, afterPath }: { onLogout: () => void; afterPath: string }) {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  return <Navigate to={afterPath} replace />;
}

function ThemeFloatingButton({
  theme,
  setTheme,
}: {
  theme: ThemeMode;
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
}) {
  const location = useLocation();
  
  // 지도 페이지에서는 테마 버튼 숨기기
  if (location.pathname === '/map' || location.pathname === '/assets/map' || location.pathname.includes('/map')) {
    return null;
  }
  
  return (
    <button
      type="button"
      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "#fff",
        cursor: "pointer",
        zIndex: 9999,
      }}
      aria-label="테마 전환"
      title="테마 전환"
    >
      {theme === "dark" ? "라이트" : "다크"}
    </button>
  );
}
