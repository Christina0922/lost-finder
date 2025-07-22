import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

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
    
    // 입력 검증
    if (!username.trim()) {
      alert('사용자명을 입력해주세요.');
      return;
    }
    
    if (!email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }
    
    if (!phone.trim()) {
      alert('휴대폰 번호를 입력해주세요.');
      return;
    }
    
    if (password.length < 4) {
      alert('비밀번호는 4자 이상 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">📱 휴대폰 번호</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01012345678 (하이픈 없이)"
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