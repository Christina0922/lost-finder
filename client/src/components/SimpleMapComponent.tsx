import React from 'react';

interface SimpleMapComponentProps {
  location: string;
  itemType: string;
  description: string;
}

const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({ location, itemType, description }) => {
  return (
    <div className="simple-map-container">
      <div className="map-placeholder">
        <div className="map-icon">🗺️</div>
        <h4>분실 위치: {location}</h4>
        <p>지도를 보려면 Google Maps API 키가 필요합니다.</p>
        <div className="location-info">
          <p><strong>분실물:</strong> {itemType}</p>
          <p><strong>설명:</strong> {description}</p>
        </div>
        <div className="api-key-notice">
          <p>Google Maps API 키를 설정하면 실제 지도를 볼 수 있습니다.</p>
          <a 
            href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
            target="_blank" 
            rel="noopener noreferrer"
            className="api-key-link"
          >
            API 키 발급받기
          </a>
        </div>
      </div>
    </div>
  );
};

export default SimpleMapComponent; 