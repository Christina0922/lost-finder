// 불필요한 버튼들을 제거하는 유틸리티 함수
export const removeUnwantedButtons = () => {
  // 제거할 텍스트 목록
  const unwantedTexts = ['전화', '문의', '저장', '길찾기', '공유', '예약'];
  
  // 모든 요소를 순회하면서 해당 텍스트를 포함하는 요소들 제거
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const text = element.textContent || '';
    
    // 분실물 목록 제목은 제외
    if (text.includes('분실물 목록') && element.tagName === 'H1') {
      return;
    }
    
    // 불필요한 텍스트를 포함하는 요소들 제거
    if (unwantedTexts.some(unwanted => text.includes(unwanted))) {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  });
  
  // 특정 클래스나 ID를 가진 요소들도 제거
  const unwantedSelectors = [
    '[class*="phone"]',
    '[class*="inquiry"]',
    '[class*="save"]',
    '[class*="find"]',
    '[class*="share"]',
    '[class*="reserve"]',
    '[id*="phone"]',
    '[id*="inquiry"]',
    '[id*="save"]',
    '[id*="find"]',
    '[id*="share"]',
    '[id*="reserve"]'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  });
};

// 페이지 로드 시 자동으로 실행
export const initCleanup = () => {
  // DOM이 로드된 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeUnwantedButtons);
  } else {
    removeUnwantedButtons();
  }
  
  // 동적으로 추가되는 요소들도 제거
  const observer = new MutationObserver(() => {
    removeUnwantedButtons();
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  return observer;
}; 