import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await onLogin(email, password);
      if (success) {
        navigate('/'); // 로그인 성공 시 메인 페이지로 이동
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container-wrapper">
      <h1>🔐 로그인</h1>
      <form onSubmit={handleSubmit} className="form-container login-form">
        <div className="form-group">
          <label htmlFor="email">📧 이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">🔒 비밀번호</label>
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
          🔑 비밀번호를 잊으셨나요?
        </Link>
        <br />
        <span style={{ marginTop: '10px', display: 'inline-block' }}>
          계정이 없으신가요? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>📝 회원가입</Link>
        </span>
      </div>
    </div>
  );
}

export default LoginPage; 