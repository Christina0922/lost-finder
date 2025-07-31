// 브라우저 콘솔에서 실행하세요
// "택배" (태봉로2길 5)와 "자전거" (고려대학교 정경대) 삭제

// 현재 localStorage에서 lostItems 가져오기
const currentItems = JSON.parse(localStorage.getItem('lostItems') || '[]');
console.log('삭제 전 아이템 수:', currentItems.length);

// 삭제할 아이템들 필터링
const filteredItems = currentItems.filter(item => {
  // "택배" at "태봉로2길 5" 삭제
  if (item.itemType === '택배' && item.location === '태봉로2길 5') {
    console.log('삭제: 택배 (태봉로2길 5)');
    return false;
  }
  
  // "자전거" at "고려대학교 정경대" 삭제
  if (item.itemType === '자전거' && item.location === '고려대학교 정경대') {
    console.log('삭제: 자전거 (고려대학교 정경대)');
    return false;
  }
  
  return true;
});

// localStorage 업데이트
localStorage.setItem('lostItems', JSON.stringify(filteredItems));
console.log('삭제 후 아이템 수:', filteredItems.length);
console.log('삭제 완료! 페이지를 새로고침하세요.'); 