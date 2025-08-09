// 쿠팡 파트너스 링크 목록
export const coupangLinks = [
  "https://link.coupang.com/a/cIFtru", // 🚨 뇌울림 3.0 PRO 도난방지 경보기
  "https://link.coupang.com/a/cIFumx", // 📍 갤럭시 스마트태그2 위치추적
  "https://link.coupang.com/a/cIFuZl", // 🔒 레오바니 자물쇠
  "https://link.coupang.com/a/cIFvsF", // 🍏 Apple 에어태그
  "https://link.coupang.com/a/cIFv4K"  // 🧷 스프링 고리형 스트랩 (5개)
];

// 다음 쿠팡 링크를 가져오는 함수
export const getNextCoupangLink = (): string => {
  // localStorage에서 현재 인덱스 읽기 (없으면 0)
  const currentIndex = parseInt(localStorage.getItem('coupang.index') || '0');
  
  // 현재 링크 반환
  const currentLink = coupangLinks[currentIndex];
  
  // 다음 인덱스 계산 (순환)
  const nextIndex = (currentIndex + 1) % coupangLinks.length;
  
  // localStorage에 다음 인덱스 저장
  localStorage.setItem('coupang.index', nextIndex.toString());
  
  return currentLink;
};

// 랜덤 쿠팡 링크를 가져오는 함수 (선택사항)
export const getRandomCoupangLink = (): string => {
  const currentIndex = parseInt(localStorage.getItem('coupang.index') || '0');
  
  // 이전 인덱스와 다른 랜덤 인덱스 생성
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * coupangLinks.length);
  } while (randomIndex === currentIndex && coupangLinks.length > 1);
  
  // localStorage에 랜덤 인덱스 저장
  localStorage.setItem('coupang.index', randomIndex.toString());
  
  return coupangLinks[randomIndex];
};
