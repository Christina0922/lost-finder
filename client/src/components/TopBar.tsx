// C:\LostFinderProject\client\src\components\TopBar.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isLoggedIn, logout } from "../utils/auth";

interface TopBarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const TopBar: React.FC<TopBarProps> = (props) => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState<boolean>(isLoggedIn());

  useEffect(() => {
    const onAuthChanged = () => setLoggedIn(isLoggedIn());
    window.addEventListener("auth-changed", onAuthChanged as EventListener);
    window.addEventListener("storage", onAuthChanged);
    return () => {
      window.removeEventListener("auth-changed", onAuthChanged as EventListener);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="topbar">
      <nav className="menu">
        <Link to="/">홈</Link>
        <Link to="/list">목록</Link>
        <Link to="/register">등록하기</Link>
        <Link to="/review">후기 쓰기</Link>
        {loggedIn ? (
          <button type="button" onClick={handleLogout}>로그아웃</button>
        ) : (
          <Link to="/login">로그인</Link>
        )}
      </nav>
    </div>
  );
};

export default TopBar;
