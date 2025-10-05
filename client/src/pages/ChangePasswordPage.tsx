// C:\LostFinderProject\client\src\pages\ChangePasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { changePassword as apiChangePassword } from '../utils/api';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

interface ChangePasswordPageProps {
  currentUser?: User;
  onChangePassword?: (oldPw: string, newPw: string) => Promise<boolean>;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ currentUser, onChangePassword }) => {
  const navigate = useNavigate();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [err, setErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setIsSubmitting(true);

    // 비밀번호 확인 검증
    if (newPw !== confirmPw) {
      setErr('새 비밀번호가 일치하지 않습니다.');
      setIsSubmitting(false);
      return;
    }

    // 비밀번호 길이 검증
    if (newPw.length < 6) {
      setErr('새 비밀번호는 6자 이상이어야 합니다.');
      setIsSubmitting(false);
      return;
    }

    try {
      const ok =
        (await onChangePassword?.(oldPw, newPw)) ??
        (await apiChangePassword(oldPw, newPw)).ok;

      if (ok) {
        alert('비밀번호가 성공적으로 변경되었습니다!');
        navigate('/settings');
      } else {
        setErr('현재 비밀번호가 올바르지 않습니다.');
      }
    } catch (error: any) {
      setErr(error?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} />
      
      <div style={{ padding: '16px 16px 24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', textAlign: 'center' }}>
          🔐 비밀번호 변경
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          textAlign: 'center', 
          margin: '0 0 24px 0',
          fontSize: 14
        }}>
          계정 보안을 위해 비밀번호를 변경하세요
        </p>

        {/* 비밀번호 변경 폼 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#374151', 
                fontWeight: 500,
                fontSize: 14
              }}>
                현재 비밀번호
              </label>
              <input
                type="password"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                required
                placeholder="현재 비밀번호를 입력하세요"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '2px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#374151', 
                fontWeight: 500,
                fontSize: 14
              }}>
                새 비밀번호
              </label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '2px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#374151', 
                fontWeight: 500,
                fontSize: 14
              }}>
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
                placeholder="새 비밀번호를 다시 입력하세요"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '2px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {err && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                color: '#dc2626',
                fontSize: 14
              }}>
                ⚠️ {err}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={isSubmitting || !oldPw || !newPw || !confirmPw}
                style={{
                  flex: 1,
                  background: isSubmitting || !oldPw || !newPw || !confirmPw ? '#9ca3af' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: isSubmitting || !oldPw || !newPw || !confirmPw ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {isSubmitting ? '변경 중...' : '비밀번호 변경'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>

        {/* 보안 팁 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: 14 }}>
            🔒 보안 팁
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
            <li>8자 이상의 비밀번호를 사용하세요</li>
            <li>숫자, 특수문자를 포함하세요</li>
            <li>다른 사이트와 다른 비밀번호를 사용하세요</li>
            <li>정기적으로 비밀번호를 변경하세요</li>
          </ul>
        </div>

        {/* 쿠팡 배너 */}
        <div style={{ marginTop: 40 }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
