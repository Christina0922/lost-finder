import React from 'react';

interface SimpleMapPlaceholderProps {
  location: string;
  itemType: string;
  description: string;
}

const SimpleMapPlaceholder: React.FC<SimpleMapPlaceholderProps> = ({ location, itemType, description }) => {
  return (
    <div className="simple-map-placeholder">
      <div className="map-header">
        <h4>🗺️ 분실 위치 정보</h4>
      </div>
      <div className="location-details">
        <div className="location-item">
          <span className="label">📍 분실 장소:</span>
          <span className="value">{location}</span>
        </div>
        <div className="location-item">
          <span className="label">📦 분실물:</span>
          <span className="value">{itemType}</span>
        </div>
        <div className="location-item">
          <span className="label">📝 상세 설명:</span>
          <span className="value">{description}</span>
        </div>
      </div>
      <div className="map-notice">
        <p>지도 기능을 사용하려면 카카오맵 API 설정이 필요합니다.</p>
        <div className="api-setup-steps">
          <h5>설정 방법:</h5>
          <ol>
            <li><a href="https://developers.kakao.com/" target="_blank" rel="noopener noreferrer">카카오 개발자 사이트</a> 방문</li>
            <li>애플리케이션 생성 후 Web 플랫폼 등록</li>
            <li>도메인에 <code>localhost:3000</code> 추가</li>
            <li>JavaScript 키를 환경변수에 설정</li>
          </ol>
        </div>
        <a 
          href="https://developers.kakao.com/docs/latest/ko/getting-started/sdk-js" 
          target="_blank" 
          rel="noopener noreferrer"
          className="api-setup-link"
        >
          카카오맵 API 설정 가이드
        </a>
      </div>
    </div>
  );
};

export default SimpleMapPlaceholder; 