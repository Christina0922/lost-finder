import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css'; // 간단한 재활용을 위해 RegisterPage의 CSS를 사용합니다.

interface LoginPageProps {
  onLogin: (email: string, pass: string) => boolean;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const success = onLogin(email, password);
    if (success) {
      navigate('/'); // 로그인 성공 시 메인 페이지로 이동
    } else {
      alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div>
      <h1>로그인</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">로그인</button>
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