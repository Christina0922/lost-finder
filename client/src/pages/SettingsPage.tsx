import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../utils/api';
import type { User } from '../types';

interface SettingsPageProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, theme, setTheme }) => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // 알림 설정 상태
  const [notificationSettings, setNotificationSettings] = useState({
    melody: true,
    vibration: true,
    silent: false
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setMessage('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleNotificationChange = (type: 'melody' | 'vibration' | 'silent') => {
    setNotificationSettings(prev => {
      const newSettings = { ...prev };
      
      if (type === 'silent') {
        // 무음 모드 토글
        newSettings.silent = !prev.silent;
        if (newSettings.silent) {
          // 무음 모드 활성화 시 다른 옵션들 비활성화
          newSettings.melody = false;
          newSettings.vibration = false;
        }
      } else {
        // 멜로디나 진동 선택 시 무음 모드 해제하고 해당 옵션 토글
        newSettings.silent = false;
        newSettings[type] = !prev[type];
      }
      
      return newSettings;
    });
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              marginRight: '12px', 
              padding: '8px 12px', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              cursor: 'pointer' 
            }}
          >
            ← 뒤로
          </button>
          <h1 style={{ 
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>설정</h1>
        </div>

        {currentUser ? (
          <div>
            {/* 테마 설정 */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '16px'
              }}>🎨 테마 설정</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '16px', color: '#333' }}>
                  {theme === 'light' ? '☀️ 라이트 모드' : '🌙 다크 모드'}
                </label>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {theme === 'light' ? '다크 모드로 변경' : '라이트 모드로 변경'}
                </button>
              </div>
            </div>

            {/* 알림 설정 */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '16px'
              }}>🔔 알림 설정</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '16px', color: '#333' }}>
                    🎵 멜로디 알림
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.melody}
                    onChange={() => handleNotificationChange('melody')}
                    disabled={notificationSettings.silent}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '16px', color: '#333' }}>
                    📳 진동 알림
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.vibration}
                    onChange={() => handleNotificationChange('vibration')}
                    disabled={notificationSettings.silent}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '16px', color: '#333' }}>
                    🔇 무음 모드
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.silent}
                    onChange={() => handleNotificationChange('silent')}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </div>
              </div>
            </div>

            {/* 비밀번호 변경 */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px' 
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '16px'
              }}>🔐 비밀번호 변경</h2>
              
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>현재 비밀번호:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>새 비밀번호:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>새 비밀번호 확인:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  비밀번호 변경
                </button>
              </form>
              {message && (
                <p style={{ 
                  marginTop: '12px', 
                  color: message.includes('성공') ? 'green' : 'red',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {message}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p>로그인이 필요합니다.</p>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              로그인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
