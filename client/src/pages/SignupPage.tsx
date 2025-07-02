import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css'; // 간단한 재활용을 위해 RegisterPage의 CSS를 사용합니다.

interface SignupPageProps {
  onSignup: (username: string, email: string, phone: string, password: string) => Promise<boolean>;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (!username.trim()) {
      alert('사용자명을 입력해주세요.');
      return;
    }
    
    if (!phone.trim()) {
      alert('휴대폰 번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await onSignup(username, email, phone, password);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container-wrapper">
      <h1>회원가입</h1>
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
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">휴대폰 번호</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="'-' 없이 숫자만 입력 (예: 01012345678)"
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
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? '가입 중...' : '가입하기'}
        </button>
      </form>
    </div>
  );
};

export default SignupPage; 