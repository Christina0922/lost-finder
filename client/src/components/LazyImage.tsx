import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'https://via.placeholder.com/200x150?text=로딩중...',
  onLoad,
  onError 
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 50px 전에 미리 로드
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        setHasError(false);
        onLoad?.();
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoaded(false);
        onError?.();
      };
      img.src = src;
    }
  }, [isInView, src, onLoad, onError]);

  // 에러 발생 시 placeholder UI 표시
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`${className} image-error-placeholder`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#9ca3af',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
        <div style={{ fontSize: '12px', fontWeight: 600 }}>이미지 로드 실패</div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      loading="lazy"
    />
  );
};

export default LazyImage; 