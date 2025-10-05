// C:\LostFinderProject\client\src\pages\ProfilePage.tsx
import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '김민수',
    email: 'yoonjeongc@gmail.com',
    phone: '010-1234-5678'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    alert('프로필이 저장되었습니다!');
    setIsEditing(false);
  };

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={true} />
      
      <div style={{ padding: '16px 16px 24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', textAlign: 'center' }}>
          👤 프로필 관리
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          textAlign: 'center', 
          margin: '0 0 24px 0',
          fontSize: 14
        }}>
          개인정보 및 계정 설정을 관리하세요
        </p>

        {/* 프로필 정보 폼 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              color: '#374151', 
              fontWeight: 500,
              fontSize: 14
            }}>
              이름
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: 12,
                border: '2px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                backgroundColor: isEditing ? '#fff' : '#f8fafc'
              }}
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
              이메일
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: 12,
                border: '2px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                backgroundColor: isEditing ? '#fff' : '#f8fafc'
              }}
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
              전화번호
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: 12,
                border: '2px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                backgroundColor: isEditing ? '#fff' : '#f8fafc'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
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
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                수정하기
              </button>
            )}
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

export default ProfilePage;
