import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css'; // 간단한 재활용을 위해 RegisterPage의 CSS를 사용합니다.

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      alert('사용자명과 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await onLogin(username, password);
      if (success) {
        navigate('/'); // 로그인 성공 시 메인 페이지로 이동
      } else {
        alert('사용자명 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container-wrapper">
      <h1>로그인</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="username">사용자명</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자명을 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>
          비밀번호를 잊으셨나요?
        </Link>
        <br />
        <span style={{ marginTop: '10px', display: 'inline-block' }}>
          계정이 없으신가요? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>회원가입</Link>
        </span>
      </div>
    </div>
  );
}

export default LoginPage; 