import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../utils/api';
import './DetailPage.css'; // 스타일 재사용

interface ChangePasswordPageProps {
  currentUser: any;
  onChangePassword: (newPassword: string) => boolean;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ currentUser, onChangePassword }) => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 로그인하지 않은 사용자는 메인 페이지로 리디렉션
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (newPassword.length < 6) {
      setMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // 임시 비밀번호 사용자는 현재 비밀번호 확인 생략
      const currentPwd = currentUser.isTemporaryPassword ? '' : currentPassword;
      
      // 서버에 비밀번호 변경 요청
      await changePassword(currentPwd, newPassword);
      
      // 로컬 상태도 업데이트
      onChangePassword(newPassword);
      
      setMessage('비밀번호가 성공적으로 변경되었습니다!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      setMessage(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인하지 않은 사용자는 렌더링하지 않음
  if (!currentUser) {
    return null;
  }

  return (
    <div className="form-container-wrapper">
      <h1>비밀번호 변경</h1>
      {currentUser.isTemporaryPassword && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '20px' 
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            <strong>보안을 위해 새로운 비밀번호를 설정해주세요.</strong>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form-container">
        {!currentUser.isTemporaryPassword && (
          <div className="form-group">
            <label htmlFor="current-password">현재 비밀번호</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              required
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="new-password">새 비밀번호</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="최소 6자 이상"
            required
            minLength={6}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password">새 비밀번호 확인</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
        </div>
        
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>

      {message && (
        <div className="reset-message">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordPage; 