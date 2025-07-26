import React, { useState } from 'react';
import './DetailPage.css'; // 스타일 재사용

interface ForgotPasswordPageProps {
  onVerifyAndResetPassword: (phone: string, code: string) => Promise<string | null>;
  onSendVerificationCode: (phone: string) => Promise<boolean>;
  onRequestPasswordResetByEmail: (email: string) => Promise<boolean>;
  theme: 'light' | 'dark';
}

type ResetMethod = 'email' | 'phone';

// 이메일 유효성 검사 함수
const validateEmail = (email: string): { isValid: boolean; error: string } => {
  if (!email) {
    return { isValid: false, error: '이메일 주소를 입력해주세요.' };
  }
  
  if (!email.includes('@')) {
    return { isValid: false, error: '이메일 주소에 @가 포함되어야 합니다.' };
  }
  
  if (!email.includes('.')) {
    return { isValid: false, error: '올바른 이메일 주소 형식이 아닙니다.' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '올바른 이메일 주소 형식이 아닙니다.' };
  }
  
  return { isValid: true, error: '' };
};

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ 
  onVerifyAndResetPassword, 
  onSendVerificationCode,
  onRequestPasswordResetByEmail,
  theme
}) => {
  const [resetMethod, setResetMethod] = useState<ResetMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  // 이메일 입력 시 실시간 검증
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail) {
      const validation = validateEmail(newEmail);
      setEmailError(validation.error);
    } else {
      setEmailError('');
    }
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    setMessage('');
    
    const success = await onSendVerificationCode(phone);
    
    setTimeout(() => {
      if (success) {
        setMessage('인증번호 6자리를 발송했습니다! 📱 개발모드에서는 콘솔에서 인증번호를 확인하세요.');
        setIsCodeSent(true);
      } else {
        setMessage('가입되지 않은 휴대폰 번호입니다.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const success = await onRequestPasswordResetByEmail(email);
      if (success) {
        setMessage('비밀번호 재설정 이메일을 발송했습니다! 📧 이메일을 확인해주세요.');
        setIsEmailSent(true);
      } else {
        setMessage('가입되지 않은 이메일 주소입니다.');
      }
    } catch (error: any) {
      setMessage(error.message || '이메일 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // 인증번호 유효성 검사
    if (!code || code.length !== 6) {
      setMessage('❌ 인증번호는 6자리 숫자여야 합니다.');
      return;
    }
    
    if (!/^\d{6}$/.test(code)) {
      setMessage('❌ 인증번호는 숫자만 입력 가능합니다.');
      return;
    }
    
    const newTempPassword = await onVerifyAndResetPassword(phone, code);

    if (newTempPassword) {
      setMessage('✅ 새로운 임시 비밀번호가 발급되었습니다. 이 비밀번호로 로그인 후 변경해주세요.');
      setTempPassword(newTempPassword);
      setIsCodeSent(false); // 다시 처음 단계로
    } else {
      setMessage('❌ 잘못된 인증번호입니다. 다시 확인해주세요.');
      setTempPassword('');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPhone('');
    setCode('');
    setIsCodeSent(false);
    setIsEmailSent(false);
    setMessage('');
    setTempPassword('');
  };

  return (
    <div className="form-container-wrapper" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: '16px', fontSize: 'min(24px, 6vw)' }}>🔑 비밀번호 재설정</h1>
      
      {!tempPassword && !isEmailSent ? (
        <>
          <div className="reset-method-selector" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: 'min(14px, 3.5vw)' }}>
              재설정 방법 선택:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'min(13px, 3.2vw)' }}>
                <input
                  type="radio"
                  name="resetMethod"
                  value="email"
                  checked={resetMethod === 'email'}
                  onChange={(e) => {
                    setResetMethod(e.target.value as ResetMethod);
                    resetForm();
                  }}
                />
                📧 이메일로 재설정
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'min(13px, 3.2vw)' }}>
                <input
                  type="radio"
                  name="resetMethod"
                  value="phone"
                  checked={resetMethod === 'phone'}
                  onChange={(e) => {
                    setResetMethod(e.target.value as ResetMethod);
                    resetForm();
                  }}
                />
                📱 SMS로 재설정
              </label>
            </div>
          </div>

          {resetMethod === 'email' ? (
            <div className="form-container" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="email" style={{ fontSize: 'min(14px, 3.5vw)', marginBottom: '6px' }}>📧 이메일 주소</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="가입한 이메일 주소를 입력하세요"
                  required
                  style={{ padding: '8px 12px', fontSize: 'min(14px, 3.5vw)' }}
                />
                {emailError && <p style={{ color: 'red', fontSize: 'min(12px, 3vw)', marginTop: '4px', marginBottom: '0' }}>{emailError}</p>}
              </div>
              
              <button 
                type="button" 
                onClick={handleSendEmail} 
                disabled={isLoading || !email || !!emailError}
                className="submit-button"
                style={{ 
                  padding: '10px 16px', 
                  fontSize: 'min(14px, 3.5vw)',
                  marginTop: '8px'
                }}
              >
                {isLoading ? '발송 중...' : '비밀번호 재설정 이메일 발송'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyAndReset} className="form-container" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="phone" style={{ fontSize: 'min(14px, 3.5vw)', marginBottom: '6px' }}>📱 휴대폰 번호</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="'-' 없이 숫자만 입력"
                    required
                    disabled={isCodeSent}
                    style={{ padding: '8px 12px', fontSize: 'min(14px, 3.5vw)', flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleSendCode} 
                    disabled={isLoading || isCodeSent || !phone}
                    style={{ 
                      flexShrink: 0, 
                      padding: '8px 12px', 
                      fontSize: 'min(12px, 3vw)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isLoading ? '발송 중...' : (isCodeSent ? '재전송' : '인증번호 발송')}
                  </button>
                </div>
              </div>
              
              {isCodeSent && (
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="code" style={{ fontSize: 'min(14px, 3.5vw)', marginBottom: '6px' }}>🔐 인증번호</label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6자리 인증번호"
                    required
                    style={{ padding: '8px 12px', fontSize: 'min(14px, 3.5vw)' }}
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                className="submit-button" 
                disabled={!isCodeSent}
                style={{ 
                  padding: '10px 16px', 
                  fontSize: 'min(14px, 3.5vw)',
                  marginTop: '8px'
                }}
              >
                인증하고 비밀번호 재설정
              </button>
            </form>
          )}
        </>
      ) : null}

      {message && (
        <div className="reset-message" style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: 'min(14px, 3.5vw)', marginBottom: '8px' }}>{message}</p>
          {tempPassword && (
            <div className="temp-password-display">
              <strong style={{ fontSize: 'min(14px, 3.5vw)' }}>임시 비밀번호: <span className="password-text">{tempPassword}</span></strong>
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: '8px', 
                padding: '10px', 
                marginTop: '8px' 
              }}>
                <p style={{ margin: 0, color: '#856404', fontSize: 'min(12px, 3vw)' }}>
                  ⚠️ <strong>보안 주의사항:</strong><br />
                  • 이 임시 비밀번호는 안전하지 않습니다<br />
                  • 로그인 후 반드시 새로운 비밀번호로 변경해주세요<br />
                  • 다른 사람과 공유하지 마세요
                </p>
              </div>
            </div>
          )}
          {isEmailSent && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              border: '1px solid #c3e6cb', 
              borderRadius: '8px', 
              padding: '12px', 
              marginTop: '12px' 
            }}>
              <p style={{ margin: 0, color: '#155724', fontSize: 'min(13px, 3.2vw)' }}>
                <strong>✅ 이메일이 발송되었습니다!</strong><br />
                📧 이메일을 확인하여 임시 비밀번호를 확인하세요.<br />
                🔐 임시 비밀번호로 로그인 후 반드시 새로운 비밀번호로 변경해주세요.
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button 
          onClick={resetForm}
          style={{ 
            background: 'none', 
            border: '1px solid #007bff', 
            color: '#007bff', 
            padding: '8px 16px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: 'min(14px, 3.5vw)'
          }}
        >
          처음부터 다시 시작
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 