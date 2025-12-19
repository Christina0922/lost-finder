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
      marginTop: '3rem',
      marginBottom: '2rem',
      padding: '2rem',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#1f2937',
        textAlign: 'center',
      }}>
        {t('monetization.title')}
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem',
      }}>
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.amazonAffiliateLink)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = '#FF9900';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: '100%',
              height: '200px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                }}
              />
            </div>
            
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1f2937',
            }}>
              {product.name}
            </h3>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1rem',
              flexGrow: 1,
              lineHeight: '1.5',
            }}>
              {product.description}
            </p>
            
            {product.price && (
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#FF9900',
                marginBottom: '1rem',
              }}>
                {product.price}
              </div>
            )}
            
            <button
              style={{
                backgroundColor: '#FF9900',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e68900';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF9900';
              }}
            >
              {t('monetization.viewOnAmazon')}
            </button>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#92400e',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0 }}>
          💡 {t('monetization.preventFutureLoss')} - {t('monetization.title')}
        </p>
      </div>
    </div>
  );
};

export default GlobalMonetizationCard;

