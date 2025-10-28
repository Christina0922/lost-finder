import React from 'react';

interface SimpleMapPlaceholderProps {
  location: string;
  itemType: string;
  description: string;
}

const SimpleMapPlaceholder: React.FC<SimpleMapPlaceholderProps> = ({ 
  location, 
  itemType, 
  description 
}) => {
  // 주소를 구글맵으로 연결하는 함수
  const openGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(location);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(googleMapsUrl, '_blank');
  };

  // 주소를 카카오맵으로 연결하는 함수
  const openKakaoMaps = () => {
    const encodedLocation = encodeURIComponent(location);
    const kakaoMapsUrl = `https://map.kakao.com/link/search/${encodedLocation}`;
    window.open(kakaoMapsUrl, '_blank');
  };

  // 네이버맵으로 연결하는 함수
  const openNaverMaps = () => {
    const encodedLocation = encodeURIComponent(location);
    const naverMapsUrl = `https://map.naver.com/v5/search/${encodedLocation}`;
    window.open(naverMapsUrl, '_blank');
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px', 
      backgroundColor: '#f8f9fa',
      textAlign: 'center'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>📍 분실 위치: {location}</h3>
      
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        border: '2px dashed #2196f3'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
          <strong>분실물:</strong> {itemType}
        </p>
        {description && (
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            <strong>설명:</strong> {description}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
          지도에서 위치를 확인하세요:
        </p>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={openGoogleMaps}
            style={{
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🗺️ 구글맵에서 보기
          </button>
          
          <button 
            onClick={openKakaoMaps}
            style={{
              backgroundColor: '#fee500',
              color: '#333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🗺️ 카카오맵에서 보기
          </button>
          
          <button 
            onClick={openNaverMaps}
            style={{
              backgroundColor: '#03c75a',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🗺️ 네이버맵에서 보기
          </button>
        </div>
      </div>

      <div style={{ 
        fontSize: '12px', 
        color: '#999',
        backgroundColor: '#f5f5f5',
        padding: '8px',
        borderRadius: '4px'
      }}>
        💡 버튼을 클릭하면 새 탭에서 해당 위치의 지도가 열립니다
      </div>
    </div>
  );
};

export default SimpleMapPlaceholder;