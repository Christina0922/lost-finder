import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  theme: 'light' | 'dark';
}

function LoginPage({ onLogin, theme }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // 이메일 유효성 검사 함수
  const validateEmail = (email: string): { isValid: boolean; error: string } => {
    if (!email) {
      return { isValid: false, error: '' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: '올바른 이메일 형식을 입력해주세요.' };
    }
    
    return { isValid: true, error: '' };
  };

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    const validation = validateEmail(newEmail);
    setEmailError(validation.error);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // 이메일 유효성 검사
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }
    
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
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      padding: '20px',
      boxSizing: 'border-box',
      paddingTop: '10vh'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '16px',
        fontSize: 'min(24px, 6vw)',
        color: theme === 'dark' ? '#fff' : '#333'
      }}>🔐 로그인</h1>
      
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="email" style={{
            fontSize: 'min(14px, 3.5vw)',
            color: theme === 'dark' ? '#fff' : '#333'
          }}>📧 이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="example@email.com"
            required
            style={{
              padding: '8px 12px',
              fontSize: 'min(14px, 3.5vw)',
              border: '1px solid #ddd',
              borderRadius: '4px',
              borderColor: emailError ? '#dc3545' : undefined,
              backgroundColor: emailError ? '#fff5f5' : undefined,
              boxSizing: 'border-box'
            }}
          />
          {emailError && (
            <p style={{ 
              color: '#dc3545', 
              fontSize: 'min(12px, 3vw)',
              marginTop: '4px',
              marginBottom: '0'
            }}>
              ❌ {emailError}
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="password" style={{
            fontSize: 'min(14px, 3.5vw)',
            color: theme === 'dark' ? '#fff' : '#333'
          }}>🔒 비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
            minLength={6}
            style={{
              padding: '8px 12px',
              fontSize: 'min(14px, 3.5vw)',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !email || !password || !!emailError}
          style={{
            padding: '10px 16px',
            fontSize: 'min(14px, 3.5vw)',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      
      <div style={{ 
        marginTop: '16px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <Link to="/forgot-password" style={{ 
          color: '#007bff', 
          textDecoration: 'none',
          fontSize: 'min(14px, 3.5vw)'
        }}>
          🔑 비밀번호를 잊으셨나요?
        </Link>
        <span style={{ 
          fontSize: 'min(14px, 3.5vw)',
          color: theme === 'dark' ? '#fff' : '#333'
        }}>
          계정이 없으신가요? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>📝 회원가입</Link>
        </span>
      </div>
    </div>
  );
}

export default LoginPage; 