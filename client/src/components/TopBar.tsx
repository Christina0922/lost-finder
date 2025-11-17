// C:\LostFinderProject\client\src\components\TopBar.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { isLoggedIn, logout } from "../utils/auth";
import "./TopBar.css";

interface TopBarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const TopBar: React.FC<TopBarProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  // App.tsx에서 전달받은 isLoggedIn prop을 우선 사용, 없으면 localStorage 체크
  const [loggedIn, setLoggedIn] = useState<boolean>(
    props.isLoggedIn !== undefined ? props.isLoggedIn : isLoggedIn()
  );

  useEffect(() => {
    // props가 변경되면 상태 업데이트
    if (props.isLoggedIn !== undefined) {
      setLoggedIn(props.isLoggedIn);
    }
    const onAuthChanged = () => {
      if (props.isLoggedIn === undefined) {
        setLoggedIn(isLoggedIn());
      }
    };
    window.addEventListener("auth-changed", onAuthChanged as EventListener);
    window.addEventListener("storage", onAuthChanged);
    return () => {
      window.removeEventListener("auth-changed", onAuthChanged as EventListener);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, [props.isLoggedIn]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    // props로 전달받은 onLogout이 있으면 사용
    if (props.onLogout) {
      props.onLogout();
    } else {
      navigate("/login", { replace: true });
    }
  };

  // 현재 경로 확인 함수
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="topbar">
      <nav className="menu">
        <Link to="/" className={isActive("/") ? "active" : ""}>
          홈
        </Link>
        <Link to="/list" className={isActive("/list") ? "active" : ""}>
          목록
        </Link>
        <Link to="/add" className={isActive("/add") || isActive("/register") ? "active" : ""}>
          등록하기
        </Link>
        <Link to="/reviews" className={isActive("/reviews") || isActive("/review") ? "active" : ""}>
          후기 쓰기
        </Link>
        {loggedIn ? (
          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <Link to="/login" className={isActive("/login") ? "active" : ""}>
            로그인
          </Link>
        )}
      </nav>
    </div>
  );
};

export default TopBar;
