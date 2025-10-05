// C:\LostFinderProject\client\src\App.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { User } from './types';

import MainPage from './pages/MainPage';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import GamePage from './pages/GamePage';
import ReviewPage from './pages/ReviewPage';
import SearchPage from './pages/SearchPage';
import HistoryPage from './pages/HistoryPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import EditPage from './pages/EditPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

// (선택) 초기 로그인 복구용: 로컬스토리지 사용
const loadUser = (): User | null => {
  try {
    const raw = localStorage.getItem('lf_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(loadUser());

  useEffect(() => {
    if (currentUser) localStorage.setItem('lf_user', JSON.stringify(currentUser));
    else localStorage.removeItem('lf_user');
  }, [currentUser]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => {
    setCurrentUser(null);
    // 로그아웃 후 홈페이지로 리다이렉트
    window.location.href = '/';
  };

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={<MainPage currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/list"
          element={<ListPage currentUser={currentUser as any} />}
        />
        <Route
          path="/detail/:id"
          element={<DetailPage currentUser={currentUser as any} />}
        />
        <Route
          path="/add"
          element={<RegisterPage currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/edit/:id"
          element={<EditPage mode="edit" currentUser={currentUser || undefined} />}
        />
        <Route
          path="/create"
          element={<EditPage mode="create" currentUser={currentUser || undefined} />}
        />
        <Route
          path="/settings"
          element={<SettingsPage onLogout={handleLogout} />}
        />
        <Route
          path="/game"
          element={<GamePage currentUser={currentUser || undefined} />}
        />
        <Route
          path="/reviews"
          element={<ReviewPage currentUser={currentUser || undefined} />}
        />
        <Route
          path="/search"
          element={<SearchPage currentUser={currentUser || undefined} />}
        />
        <Route
          path="/history"
          element={<HistoryPage currentUser={currentUser || undefined} />}
        />
        <Route
          path="/success-stories"
          element={<SuccessStoriesPage currentUser={currentUser || undefined} />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />
        <Route
          path="/change-password"
          element={<ChangePasswordPage />}
        />
        <Route
          path="/profile"
          element={<ProfilePage />}
        />
        <Route
          path="/notifications"
          element={<NotificationsPage />}
        />
        <Route
          path="/login"
          element={<LoginPage currentUser={currentUser} onLogout={handleLogout} onLogin={handleLogin} />}
        />
      </Routes>
    </div>
  );
}
