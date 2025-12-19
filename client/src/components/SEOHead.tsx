import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
}) => {
  const { t, i18n } = useTranslation();
  
  const defaultTitle = t('app.title');
  const defaultDescription = t('app.subtitle');
  const siteUrl = url || window.location.origin;
  const defaultImage = `${siteUrl}/logo512.png`;

  const pageTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || 'lost, found, 분실물, 찾기, lost and found, global service';
  const pageImage = image || defaultImage;

  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="language" content={i18n.language} />
      
      {/* Open Graph 메타 태그 */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={i18n.language === 'ko' ? 'ko_KR' : i18n.language === 'ja' ? 'ja_JP' : 'en_US'} />
      
      {/* Twitter Card 메타 태그 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* 추가 메타 태그 */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#007bff" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={siteUrl} />
    </Helmet>
  );
};

export default SEOHead;

