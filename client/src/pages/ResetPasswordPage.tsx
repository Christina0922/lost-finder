import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './DetailPage.css';

interface ResetPasswordPageProps {
  onPasswordReset: (newPassword: string) => boolean;
  theme: 'light' | 'dark';
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onPasswordReset, theme }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isTokenValidating, setIsTokenValidating] = useState(true);
  
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setMessage('❌ 유효하지 않은 재설정 링크입니다.');
        setIsTokenValidating(false);
        return;
      }

      try {
        // 토큰 유효성 검증을 위한 더미 요청 (실제로는 서버에서 검증)
        const response = await fetch('http://localhost:3000/api/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          setIsValidToken(true);
        } else {
          const data = await response.json();
          if (data.error.includes('만료')) {
            setMessage('❌ 재설정 링크가 만료되었습니다. 새로운 링크를 요청해주세요.');
          } else {
            setMessage('❌ 유효하지 않은 재설정 링크입니다.');
          }
        }
      } catch (error) {
        // 서버 검증 API가 없을 경우 클라이언트에서 기본 검증
        if (token && token.length >= 20) {
          setIsValidToken(true);
        } else {
          setMessage('❌ 유효하지 않은 재설정 링크입니다.');
        }
      } finally {
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setMessage('❌ 유효하지 않은 재설정 링크입니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('❌ 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/reset-password-with-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ 비밀번호가 성공적으로 변경되었습니다!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (data.error.includes('만료')) {
          setMessage('❌ 재설정 링크가 만료되었습니다. 새로운 링크를 요청해주세요.');
        } else if (data.error.includes('유효하지 않은')) {
          setMessage('❌ 유효하지 않은 재설정 링크입니다.');
        } else {
          setMessage(`❌ ${data.error}`);
        }
      }
    } catch (error) {
      setMessage('❌ 비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValidating) {
    return (
      <div className="form-container-wrapper">
        <h1>🔑 비밀번호 재설정</h1>
        <div className="form-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #007bff', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>링크를 확인하는 중...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="form-container-wrapper">
        <h1>🔑 비밀번호 재설정</h1>
        <div className="form-container">
          <div style={{ 
            backgroundColor: '#f8d7da', 
            border: '1px solid #f5c6cb', 
            borderRadius: '8px', 
            padding: '20px', 
            textAlign: 'center' 
          }}>
            <p style={{ color: '#721c24', margin: 0, fontSize: '16px' }}>{message}</p>
            <button 
              onClick={() => navigate('/forgot-password')}
              style={{ 
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              비밀번호 재설정 다시 요청
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container-wrapper">
      <h1>🔑 비밀번호 재설정</h1>
      
      <div className="form-container">
        <div style={{ 
          backgroundColor: '#d1ecf1', 
          border: '1px solid #bee5eb', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <p style={{ color: '#0c5460', margin: 0, fontSize: '14px' }}>
            🔐 새로운 비밀번호를 입력해주세요.<br />
            ⚠️ 이 링크는 한 번만 사용할 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요 (최소 6자)"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {message && (
            <div style={{ 
              backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
              border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ 
                color: message.includes('✅') ? '#155724' : '#721c24',
                margin: 0 
              }}>
                {message}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || !newPassword || !confirmPassword}
          >
            {isLoading ? '처리 중...' : '비밀번호 변경'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center' 
        }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'none',
              border: '1px solid #007bff',
              color: '#007bff',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 