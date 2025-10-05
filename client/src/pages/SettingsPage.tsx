// C:\LostFinderProject\client\src\pages\SettingsPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

export interface SettingsPageProps {
  onLogout?: () => void; // TopBar에서 사용
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const settingsItems = [
    {
      id: 'password',
      title: '🔐 비밀번호 변경',
      description: '계정 비밀번호를 변경합니다',
      action: () => navigate('/change-password')
    },
    {
      id: 'profile',
      title: '👤 프로필 관리',
      description: '개인정보 및 계정 설정을 관리합니다',
      action: () => navigate('/profile')
    },
    {
      id: 'notifications',
      title: '🔔 알림 설정',
      description: '푸시 알림 및 이메일 알림을 설정합니다',
      action: () => navigate('/notifications')
    }
  ];

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={true} onLogout={onLogout} />
      
      <div style={{ padding: '16px 16px 24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', textAlign: 'center' }}>
          ⚙️ 설정
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          textAlign: 'center', 
          margin: '0 0 24px 0',
          fontSize: 14
        }}>
          LostFinder 앱 설정을 관리하세요
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          {settingsItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: 16,
                borderRadius: 12,
                background: '#fff',
                border: '1px solid #e2e8f0',
                color: '#111827',
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textAlign: 'left',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  {item.description}
                </div>
              </div>
              <span style={{ opacity: 0.6, fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>

        {/* 앱 정보 섹션 */}
        <div style={{
          marginTop: 32,
          padding: 20,
          background: '#f8fafc',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: 16 }}>
            📱 앱 정보
          </h3>
          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 8px 0' }}>LostFinder v1.0.0</p>
            <p style={{ margin: '0 0 8px 0' }}>분실물 찾기 서비스</p>
            <p style={{ margin: 0 }}>© 2024 LostFinder. All rights reserved.</p>
          </div>
        </div>

        {/* 쿠팡 배너 */}
        <div style={{ marginTop: 40 }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
