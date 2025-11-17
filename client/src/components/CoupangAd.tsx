import React from 'react';
import './CoupangAd.css';

interface CoupangAdProps {
  type?: 'banner' | 'reward' | 'product';
  productUrl?: string;
  onRewardClick?: () => void;
  title?: string;
  description?: string;
  showReward?: boolean;
}

const CoupangAd: React.FC<CoupangAdProps> = ({
  type = 'banner',
  productUrl,
  onRewardClick,
  title = '오늘의 추천 상품',
  description,
  showReward = false
}) => {
  // 실제 쿠팡 파트너스 링크로 교체 필요
  const defaultUrl = productUrl || 'https://link.coupang.com/recommend/learning';

  const handleClick = () => {
    // 쿠팡 링크 열기
    window.open(defaultUrl, '_blank');
    
    // 보상이 있는 경우 (퍼즐 클리어 후)
    if (showReward && onRewardClick) {
      onRewardClick();
    }
  };

  if (type === 'banner') {
    return (
      <div className="coupang-banner" onClick={handleClick}>
        <div className="banner-content">
          <div className="banner-icon">🛒</div>
          <div className="banner-text">
            <div className="banner-title">{title}</div>
            <div className="banner-subtitle">쿠팡에서 보기</div>
          </div>
          <div className="banner-arrow">→</div>
        </div>
      </div>
    );
  }

  if (type === 'reward') {
    return (
      <div className="coupang-reward-ad">
        <div className="reward-content">
          <div className="reward-icon">🎁</div>
          <div className="reward-text">
            <div className="reward-title">{title}</div>
            {description && <div className="reward-description">{description}</div>}
            {showReward && (
              <div className="reward-bonus">+ 코인 10개 보너스!</div>
            )}
          </div>
          <button className="reward-button" onClick={handleClick}>
            상품 보러가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="coupang-product-ad">
      <div className="product-content" onClick={handleClick}>
        <div className="product-icon">📚</div>
        <div className="product-text">
          <div className="product-title">{title}</div>
          {description && <div className="product-description">{description}</div>}
        </div>
      </div>
    </div>
  );
};

export default CoupangAd;

