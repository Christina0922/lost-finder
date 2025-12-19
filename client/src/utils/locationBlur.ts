/**
 * 위치 정보를 모호화하여 GDPR 준수를 위한 유틸리티
 * 상세 주소 대신 대략적인 지역 정보만 반환
 */

export interface BlurredLocation {
  area: string; // 예: "강남구 역삼동"
  radius: string; // 예: "지도상 반경 500m"
  fullText: string; // 전체 텍스트
}

/**
 * 주소 문자열을 파싱하여 모호화된 위치 정보 반환
 * @param location 원본 위치 문자열
 * @returns 모호화된 위치 정보
 */
export const blurLocation = (location: string): BlurredLocation => {
  if (!location || location.trim() === '') {
    return {
      area: '',
      radius: '500m',
      fullText: '',
    };
  }

  // 한국 주소 패턴 (시/도, 구/군, 동/면/리)
  const koreanPattern = /([가-힣]+(?:시|도)?)\s*([가-힣]+(?:구|군|시))?\s*([가-힣]+(?:동|면|리))?/;
  const koreanMatch = location.match(koreanPattern);

  if (koreanMatch) {
    const [, si, gu, dong] = koreanMatch;
    let area = '';
    
    if (gu && dong) {
      area = `${gu} ${dong}`;
    } else if (gu) {
      area = gu;
    } else if (si) {
      area = si;
    } else {
      area = location.split(' ')[0] || location;
    }

    return {
      area,
      radius: '500m',
      fullText: `${area} 근처`,
    };
  }

  // 영어 주소 패턴 (City, State, Street)
  const englishPattern = /([A-Za-z\s]+(?:City|Town|Village)?),?\s*([A-Z]{2})?/i;
  const englishMatch = location.match(englishPattern);

  if (englishMatch) {
    const [, city] = englishMatch;
    return {
      area: city?.trim() || location.split(',')[0] || location,
      radius: '500m',
      fullText: `Near ${city?.trim() || location.split(',')[0] || location}`,
    };
  }

  // 일본어 주소 패턴 (都道府県, 市区町村)
  const japanesePattern = /([都道府県]+)?([市区町村]+)?/;
  const japaneseMatch = location.match(japanesePattern);

  if (japaneseMatch) {
    const [, prefecture, city] = japaneseMatch;
    const area = city || prefecture || location.split(' ')[0] || location;
    return {
      area,
      radius: '500m',
      fullText: `${area}付近`,
    };
  }

  // 패턴 매칭 실패 시 첫 번째 단어 또는 전체 문자열의 일부 사용
  const firstPart = location.split(/[,\s]/)[0] || location.substring(0, 10);
  return {
    area: firstPart,
    radius: '500m',
    fullText: `${firstPart} 근처`,
  };
};

/**
 * 위치 정보를 i18n 키와 함께 포맷팅
 * @param location 원본 위치 문자열
 * @param t i18n 번역 함수
 * @returns 포맷팅된 위치 문자열
 */
export const formatBlurredLocation = (
  location: string,
  t: (key: string, options?: any) => string | any
): string => {
  const blurred = blurLocation(location);
  
  if (!blurred.area) {
    return location; // 원본 반환
  }

  const result = t('location.nearby', { area: blurred.area });
  return typeof result === 'string' ? result : location;
};

