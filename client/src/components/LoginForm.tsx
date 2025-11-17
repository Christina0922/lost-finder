// C:\LostFinderProject\client\src\components\LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../utils/api';

type Props = {
  onLogin: (user: any) => void;
};

const LoginForm: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const data = await AuthAPI.login(email.trim(), pw);
      if (data && data.user) {
        onLogin(data.user);      // 상위(App) 상태 업데이트
        navigate('/', { replace: true }); // ✅ 로그인 성공 시 홈으로 이동
      } else {
        // 서버 오류도 비밀번호 오류로 표시
        setErr('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (e: any) {
      // 모든 오류를 사용자 친화적인 메시지로 변환
      let errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      
      // 네트워크 오류만 별도 처리
      if (e.name === 'TypeError' && (e.message?.includes('fetch') || e.message?.includes('Failed to fetch'))) {
        errorMessage = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
      } else if (e.message && !e.message.includes('서버 오류')) {
        // 서버 오류가 아닌 경우에만 서버 메시지 사용
        errorMessage = e.message;
      }
      
      setErr(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ 
      maxWidth: 420, 
      width: '100%',
      minWidth: 0, // flexbox에서 넘침 방지
      margin: '0 auto',
      background: '#ffffff',
      padding: '32px 24px',
      borderRadius: 16,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box' // padding 포함한 너비 계산
    }}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 8,
          fontWeight: 600,
          color: '#374151',
          fontSize: 14
        }}>
          이메일
        </label>
        <input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ 
            width: '100%', 
            maxWidth: '100%',
            minWidth: 0,
            padding: '12px 16px', 
            marginBottom: 12,
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box' // padding 포함한 너비 계산
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 8,
          fontWeight: 600,
          color: '#374151',
          fontSize: 14
        }}>
          비밀번호
        </label>
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          style={{ 
            width: '100%', 
            maxWidth: '100%',
            minWidth: 0,
            padding: '12px 16px', 
            marginBottom: 12,
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box' // padding 포함한 너비 계산
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      </div>

      {err && (
        <div style={{ 
          color: '#dc2626', 
          marginBottom: 16,
          padding: '12px',
          background: '#fef2f2',
          borderRadius: 8,
          border: '1px solid #fecaca',
          fontSize: 14
        }}>
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        style={{ 
          width: '100%', 
          padding: '14px 16px', 
          background: busy ? '#9ca3af' : 'linear-gradient(180deg, #ff5f9a, #ff3a6e)',
          color: '#fff', 
          border: 0, 
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: busy ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: busy ? 'none' : '0 4px 12px rgba(255, 58, 110, 0.3)'
        }}
        onMouseEnter={(e) => {
          if (!busy) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 58, 110, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!busy) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 58, 110, 0.3)';
          }
        }}
      >
        {busy ? '로그인 중…' : '로그인'}
      </button>

      <div style={{ 
        textAlign: 'center', 
        marginTop: 24, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12,
        paddingTop: 24,
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#6b7280', 
            textDecoration: 'none', 
            cursor: 'pointer',
            fontSize: 14,
            padding: '8px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
        >
          비밀번호를 잊으셨나요?
        </button>
        
        <div style={{ 
          fontSize: 14, 
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4
        }}>
          <span>계정이 없으신가요?</span>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3b82f6', 
              textDecoration: 'none', 
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              padding: '4px 8px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
          >
            회원가입
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
