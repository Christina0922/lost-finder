import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css'; // 간단한 재활용을 위해 RegisterPage의 CSS를 사용합니다.

interface SignupPageProps {
  onSignup: (email: string, pass: string, phone: string) => boolean;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (onSignup(email, password, phone)) {
      navigate('/');
    }
  };

  return (
    <div className="form-container-wrapper">
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="'-' 없이 숫자만 입력"
            required
          />
        </div>
        <button type="submit" className="submit-button">가입하기</button>
      </form>
    </div>
  );
};

export default SignupPage; 