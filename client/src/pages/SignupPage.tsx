import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

interface SignupPageProps {
  onSignup: (username: string, email: string, phone: string, password: string) => Promise<boolean>;
  theme: 'light' | 'dark';
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, theme }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  // 유효성 검사 함수들
  const validateEmail = (email: string): string => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : '올바른 이메일 형식을 입력해주세요.';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return '';
    const phoneRegex = /^01[0-9]{8,9}$/;
    return phoneRegex.test(phone) ? '' : '올바른 휴대폰 번호를 입력해주세요. (01012345678)';
  };

  const validatePassword = (password: string): string => {
    if (!password) return '';
    if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) return '';
    return password === confirmPassword ? '' : '비밀번호가 일치하지 않습니다.';
  };

  // 입력 변경 핸들러들
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setErrors(prev => ({ ...prev, email: validateEmail(newEmail) }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhone(newPhone);
    setErrors(prev => ({ ...prev, phone: validatePhone(newPhone) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setErrors(prev => ({ 
      ...prev, 
      password: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword)
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(password, newConfirmPassword) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // 모든 유효성 검사 실행
    const newErrors = {
      email: validateEmail(email),
      phone: validatePhone(phone),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword)
    };
    
    setErrors(newErrors);
    
    // 오류가 있으면 제출 중단
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // 입력 검증
    if (!username.trim()) {
      alert('사용자명을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await onSignup(username, email, phone, password);
      if (success) {
        alert('🎉 회원가입이 완료되었습니다!');
        navigate('/');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error);
  const isFormValid = username.trim() && email.trim() && phone.trim() && password.trim() && confirmPassword.trim() && !hasErrors;

  return (
    <div className="form-container-wrapper">
      <h1>📝 회원가입</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="username">👤 사용자명</label>
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
          <label htmlFor="email">📧 이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="example@email.com"
            required
            style={{
              borderColor: errors.email ? '#dc3545' : undefined,
              backgroundColor: errors.email ? '#fff5f5' : undefined
            }}
          />
          {errors.email && (
            <p style={{ 
              color: '#dc3545', 
              fontSize: '0.875em', 
              marginTop: '5px',
              marginBottom: '0'
            }}>
              ❌ {errors.email}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="phone">📱 휴대폰 번호</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="01012345678 (하이픈 없이)"
            required
            style={{
              borderColor: errors.phone ? '#dc3545' : undefined,
              backgroundColor: errors.phone ? '#fff5f5' : undefined
            }}
          />
          {errors.phone && (
            <p style={{ 
              color: '#dc3545', 
              fontSize: '0.875em', 
              marginTop: '5px',
              marginBottom: '0'
            }}>
              ❌ {errors.phone}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">🔒 비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="비밀번호를 입력하세요 (6자 이상)"
            required
            minLength={6}
            style={{
              borderColor: errors.password ? '#dc3545' : undefined,
              backgroundColor: errors.password ? '#fff5f5' : undefined
            }}
          />
          {errors.password && (
            <p style={{ 
              color: '#dc3545', 
              fontSize: '0.875em', 
              marginTop: '5px',
              marginBottom: '0'
            }}>
              ❌ {errors.password}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">🔐 비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="비밀번호를 다시 입력하세요"
            required
            style={{
              borderColor: errors.confirmPassword ? '#dc3545' : undefined,
              backgroundColor: errors.confirmPassword ? '#fff5f5' : undefined
            }}
          />
          {errors.confirmPassword && (
            <p style={{ 
              color: '#dc3545', 
              fontSize: '0.875em', 
              marginTop: '5px',
              marginBottom: '0'
            }}>
              ❌ {errors.confirmPassword}
            </p>
          )}
        </div>
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  );
};

export default SignupPage; 