// 특정 분실물 삭제 스크립트
// 브라우저 콘솔에서 실행하거나, localStorage를 직접 수정할 때 사용

console.log('🗑️ 특정 분실물 삭제 스크립트 시작...');

// localStorage에서 분실물 데이터 가져오기
const lostItems = JSON.parse(localStorage.getItem('lostItems') || '[]');
console.log('📋 현재 분실물 목록:', lostItems);

// 삭제할 분실물 필터링 (택배와 자전거)
const itemsToDelete = lostItems.filter(item => 
  (item.itemType === '택배' && item.location === '태봉로2길 5') ||
  (item.itemType === '자전거' && item.location === '고려대학교 정경대')
);

console.log('🎯 삭제할 분실물:', itemsToDelete);

if (itemsToDelete.length === 0) {
  console.log('❌ 삭제할 분실물을 찾을 수 없습니다.');
} else {
  // 삭제할 항목들을 제외한 새로운 배열 생성
  const updatedItems = lostItems.filter(item => 
    !((item.itemType === '택배' && item.location === '태봉로2길 5') ||
      (item.itemType === '자전거' && item.location === '고려대학교 정경대'))
  );
  
  // localStorage 업데이트
  localStorage.setItem('lostItems', JSON.stringify(updatedItems));
  
  console.log('✅ 분실물 삭제 완료!');
  console.log(`🗑️ 삭제된 항목 수: ${itemsToDelete.length}개`);
  console.log('📋 남은 분실물 수:', updatedItems.length);
  
  // 삭제된 항목 상세 정보 출력
  itemsToDelete.forEach((item, index) => {
    console.log(`${index + 1}. ${item.itemType} - ${item.location} (${item.description})`);
  });
}

console.log('🎉 삭제 작업 완료! 페이지를 새로고침하면 변경사항이 반영됩니다.'); 