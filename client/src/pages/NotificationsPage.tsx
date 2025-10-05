// C:\LostFinderProject\client\src\pages\NotificationsPage.tsx
import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

const NotificationsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    commentAlerts: true,
    newItemAlerts: false
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    alert('알림 설정이 저장되었습니다!');
  };

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={true} />
      
      <div style={{ padding: '16px 16px 24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', textAlign: 'center' }}>
          🔔 알림 설정
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          textAlign: 'center', 
          margin: '0 0 24px 0',
          fontSize: 14
        }}>
          푸시 알림 및 이메일 알림을 설정하세요
        </p>

        {/* 알림 설정 폼 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
            📱 푸시 알림
          </h3>
          
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                  푸시 알림 받기
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  모든 알림을 푸시로 받습니다
                </div>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                style={{
                  width: 48,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: settings.pushNotifications ? '#3b82f6' : '#d1d5db',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 2,
                  left: settings.pushNotifications ? 26 : 2,
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                  댓글 알림
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  내 분실물에 댓글이 달리면 알림
                </div>
              </div>
              <button
                onClick={() => handleToggle('commentAlerts')}
                style={{
                  width: 48,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: settings.commentAlerts ? '#3b82f6' : '#d1d5db',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 2,
                  left: settings.commentAlerts ? 26 : 2,
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0'
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                  새 분실물 알림
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  새로운 분실물이 등록되면 알림
                </div>
              </div>
              <button
                onClick={() => handleToggle('newItemAlerts')}
                style={{
                  width: 48,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: settings.newItemAlerts ? '#3b82f6' : '#d1d5db',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 2,
                  left: settings.newItemAlerts ? 26 : 2,
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* 이메일 알림 설정 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: 16 }}>
            📧 이메일 알림
          </h3>
          
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0'
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                  이메일 알림 받기
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  중요한 알림을 이메일로 받습니다
                </div>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                style={{
                  width: 48,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: settings.emailNotifications ? '#3b82f6' : '#d1d5db',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 2,
                  left: settings.emailNotifications ? 26 : 2,
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 24
          }}
        >
          설정 저장
        </button>

        {/* 쿠팡 배너 */}
        <div style={{ marginTop: 40 }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
