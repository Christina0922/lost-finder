import React, { useState } from 'react';
import './DetailPage.css'; // 스타일 재사용

interface ForgotPasswordPageProps {
  onResetPasswordByPhone: (phone: string, code: string) => string | null;
  onSendVerificationCode: (phone: string) => Promise<boolean>;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onResetPasswordByPhone, onSendVerificationCode }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const handleSendCode = async () => {
    setIsLoading(true);
    setMessage('');
    
    const success = await onSendVerificationCode(phone);
    
    setTimeout(() => {
      if (success) {
        setMessage('인증번호가 발송되었습니다. (실제 SMS로 수신, 환경변수 미설정 시 콘솔에서 확인)');
        setIsCodeSent(true);
      } else {
        setMessage('가입되지 않은 휴대폰 번호입니다.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyAndReset = (event: React.FormEvent) => {
    event.preventDefault();
    const newTempPassword = onResetPasswordByPhone(phone, code);

    if (newTempPassword) {
      setMessage('새로운 임시 비밀번호가 발급되었습니다. 이 비밀번호로 로그인 후 변경해주세요.');
      setTempPassword(newTempPassword);
      setIsCodeSent(false); // 다시 처음 단계로
    } else {
      setMessage('인증번호가 올바르지 않습니다.');
      setTempPassword('');
    }
  };

  return (
    <div className="form-container-wrapper">
      <h1>비밀번호 재설정</h1>
      
      {!tempPassword ? (
        <form onSubmit={handleVerifyAndReset} className="form-container">
          <div className="form-group">
            <label htmlFor="phone">휴대폰 번호</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="'-' 없이 숫자만 입력"
                required
                disabled={isCodeSent}
              />
              <button type="button" onClick={handleSendCode} disabled={isLoading || isCodeSent} style={{ flexShrink: 0 }}>
                {isLoading ? '발송 중...' : (isCodeSent ? '재전송' : '인증번호 발송')}
              </button>
            </div>
          </div>
          
          {isCodeSent && (
            <div className="form-group">
              <label htmlFor="code">인증번호</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6자리 인증번호"
                required
              />
            </div>
          )}
          
          <button type="submit" className="submit-button" disabled={!isCodeSent}>
            인증하고 비밀번호 재설정
          </button>
        </form>
      ) : null}

      {message && (
        <div className="reset-message">
          <p>{message}</p>
          {tempPassword && (
            <div className="temp-password-display">
              <strong>임시 비밀번호: <span className="password-text">{tempPassword}</span></strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage; 