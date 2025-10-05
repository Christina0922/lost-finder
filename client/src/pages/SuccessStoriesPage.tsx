import React from 'react';
import type { User } from '../types';
import TopBar from '../components/TopBar';
import CoupangBanner from '../components/CoupangBanner';

interface SuccessStoriesPageProps {
  currentUser?: User | null;
}

const SuccessStoriesPage: React.FC<SuccessStoriesPageProps> = ({ currentUser }) => {
  const successStories = [
    {
      id: 1,
      title: "지갑을 찾았어요! 🎉",
      author: "김민수",
      date: "2024-01-15",
      content: "지하철에서 지갑을 잃어버렸는데, LostFinder를 통해 3일 만에 찾았습니다. 정말 감사해요!",
      category: "지갑"
    },
    {
      id: 2,
      title: "핸드폰 복구 성공 📱",
      author: "이영희",
      date: "2024-01-10",
      content: "카페에서 핸드폰을 두고 나왔는데, 좋은 분이 등록해주셔서 바로 연락이 왔어요. 세상에 착한 사람이 많네요!",
      category: "핸드폰"
    },
    {
      id: 3,
      title: "가방을 찾았습니다 🎒",
      author: "박철수",
      date: "2024-01-08",
      content: "버스에서 내릴 때 가방을 두고 내렸는데, 운전기사분이 LostFinder에 등록해주셨어요. 정말 고마웠습니다.",
      category: "가방"
    },
    {
      id: 4,
      title: "열쇠를 찾았어요! 🔑",
      author: "최지영",
      date: "2024-01-05",
      content: "공원에서 산책하다가 열쇠를 잃어버렸는데, 다른 분이 발견해서 등록해주셨네요. LostFinder 덕분에 집에 들어갈 수 있었어요!",
      category: "열쇠"
    },
    {
      id: 5,
      title: "신분증 복구 완료 🆔",
      author: "정민호",
      date: "2024-01-03",
      content: "신분증을 잃어버려서 정말 당황했는데, LostFinder를 통해 찾을 수 있었습니다. 정말 감사합니다!",
      category: "신분증"
    }
  ];

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} />
      
      <div style={{ padding: '16px' }}>
        <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>
          🏆 성공 사례
        </h2>
        
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginBottom: '24px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          LostFinder를 통해 분실물을 찾은 감동적인 이야기들을 모았습니다.
          <br />
          여러분의 이야기도 들려주세요!
        </p>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {successStories.map((story) => (
            <div
              key={story.id}
              style={{
                padding: '20px',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  color: '#333',
                  flex: 1
                }}>
                  {story.title}
                </h3>
                <span style={{
                  background: '#007bff',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {story.category}
                </span>
              </div>
              
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                color: '#555',
                lineHeight: '1.5'
              }}>
                {story.content}
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#888'
              }}>
                <span>작성자: {story.author}</span>
                <span>{story.date}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          marginTop: '32px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>
            💬 여러분의 이야기를 들려주세요!
          </h3>
          <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
            LostFinder를 통해 분실물을 찾은 경험이 있으시다면,
            <br />
            다른 분들에게 희망을 주는 이야기를 공유해주세요.
          </p>
          <button
            style={{
              background: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => alert('후기 작성 기능은 준비 중입니다!')}
          >
            후기 작성하기
          </button>
        </div>
        
        <div style={{ marginTop: '40px' }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesPage;