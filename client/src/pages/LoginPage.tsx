import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

import { login } from '../utils/api';
import type { User } from '../types';

interface LoginPageProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
}

function LoginPage({ currentUser, onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(''); // 에러 메시지 제거
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log('로그인 폼 제출됨');
    console.log('이메일:', email);
    console.log('비밀번호:', password);
    
    if (!email.trim() || !password.trim()) {
      console.log('이메일 또는 비밀번호가 비어있음');
      return;
    }
    
    setIsLoading(true);
    console.log('로그인 API 호출 시작...');
    
    try {
      const result = await login(email, password);
      console.log('로그인 API 응답:', result);
      
      // API 응답 확인
      if (result && result.success && result.user) {
        console.log('로그인 성공, 사용자 정보:', result.user);
        // User 타입에 맞게 변환
        const user: User = {
          id: 1, // 임시 ID (실제로는 서버에서 받아야 함)
          username: result.user.username || result.user.email || '사용자',
          email: result.user.email,
          password: '', // 보안상 비밀번호는 저장하지 않음
        };
        onLogin(user);
        navigate('/'); // 로그인 성공 시 메인 페이지로 이동
      } else {
        // 로그인 실패 시 조용히 처리
        console.error('로그인 실패:', result?.error || '알 수 없는 오류');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      // 에러 팝업 제거 - 조용히 처리
    } finally {
      setIsLoading(false);
      console.log('로그인 처리 완료');
    }
  };

  // 이미 로그인한 상태라면 다른 화면 표시
  if (currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '0',
        boxSizing: 'border-box'
      }}>
        <div style={{ padding: '20px', paddingTop: '20px' }}>
          <h1 style={{
            textAlign: 'center',
            marginBottom: '16px',
            fontSize: 'min(24px, 6vw)',
            color: '#333'
          }}>👋 안녕하세요, {currentUser.username}님!</h1>
          
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
              이미 로그인되어 있습니다.
            </p>
            <button
              onClick={() => onLogin(null as any)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      padding: '0',
      boxSizing: 'border-box'
    }}>

      
      <div style={{ padding: '20px', paddingTop: '20px' }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '16px',
          fontSize: 'min(24px, 6vw)',
          color: '#333'
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
              color: '#333'
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
              color: '#333'
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
        
        
      </div>
    </div>
  );
}

export default LoginPage; 