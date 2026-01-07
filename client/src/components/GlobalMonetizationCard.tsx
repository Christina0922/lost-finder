import React from 'react';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  amazonAffiliateLink: string;
  price?: string;
}

interface GlobalMonetizationCardProps {
  className?: string;
}

const GlobalMonetizationCard: React.FC<GlobalMonetizationCardProps> = ({ className }) => {
  const { t } = useTranslation();

  // 샘플 상품 데이터
  const products: Product[] = [
    {
      id: 'airtag',
      name: t('monetization.products.airtag.name'),
      description: t('monetization.products.airtag.description'),
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81-QB7nDh4L._AC_SL1500_.jpg',
      amazonAffiliateLink: 'https://www.amazon.com/dp/B0932QJ2JZ?tag=lostfinder-20',
      price: '$29.00',
    },
    {
      id: 'tile',
      name: t('monetization.products.tile.name'),
      description: t('monetization.products.tile.description'),
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71QN8K9jy6L._AC_SL1500_.jpg',
      amazonAffiliateLink: 'https://www.amazon.com/dp/B07W6ZQYVF?tag=lostfinder-20',
      price: '$24.99',
    },
    {
      id: 'backpack',
      name: t('monetization.products.backpack.name'),
      description: t('monetization.products.backpack.description'),
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71vFKBpKakL._AC_SL1500_.jpg',
      amazonAffiliateLink: 'https://www.amazon.com/dp/B07XJ8C8F5?tag=lostfinder-20',
      price: '$39.99',
    },
  ];

  const handleProductClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`global-monetization-card ${className || ''}`} style={{
      marginTop: '2rem',
      marginBottom: '1rem',
      padding: '1rem',
      backgroundColor: '#fef3c7',
      borderRadius: '8px',
      border: '1px solid #fde68a',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          fontSize: '0.875rem',
          color: '#92400e',
          fontWeight: '500',
        }}>
          💡 {t('monetization.preventFutureLoss')} - 분실 방지 제품 추천
        </div>
        
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          {products.map((product) => (
            <a
              key={product.id}
              href={product.amazonAffiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#667eea';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#667eea';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {product.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalMonetizationCard;

