const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

const testData = [
  {
    author_id: 1,
    item_type: '지갑',
    description: '검정색 가죽 지갑입니다. 신용카드 3장이 들어있었습니다.',
    location: '고려대학교 병원',
    lat: 37.5900,
    lng: 127.0265,
    place_name: '고려대학교병원',
    address: '서울특별시 성북구 안암로 73',
    created_by_device_id: 'test-device-001',
    image_urls: '[]'
  },
  {
    author_id: 1,
    item_type: '핸드폰',
    description: '아이폰 13 프로 블루 색상입니다. 케이스에 스티커가 붙어있습니다.',
    location: '강남역',
    lat: 37.4979,
    lng: 127.0276,
    place_name: '강남역',
    address: '서울특별시 강남구 역삼동',
    created_by_device_id: 'test-device-002',
    image_urls: '[]'
  },
  {
    author_id: 1,
    item_type: '우산',
    description: '빨간색 자동 우산입니다. 손잡이에 곰돌이 스티커가 있습니다.',
    location: '남사중학교',
    lat: 37.5642,
    lng: 126.9876,
    place_name: '남사중학교',
    address: '서울특별시 중구',
    created_by_device_id: 'test-device-003',
    image_urls: '[]'
  }
];

const sql = `
  INSERT INTO lost_items (
    author_id, item_type, description, location, 
    lat, lng, place_name, address, 
    lost_at, created_by_device_id, image_urls
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
`;

let completed = 0;
testData.forEach((data, index) => {
  db.run(sql, [
    data.author_id,
    data.item_type,
    data.description,
    data.location,
    data.lat,
    data.lng,
    data.place_name,
    data.address,
    data.created_by_device_id,
    data.image_urls
  ], (err) => {
    if (err) {
      console.error(`❌ 데이터 ${index + 1} 추가 실패:`, err.message);
    } else {
      console.log(`✅ 데이터 ${index + 1} 추가 완료: ${data.item_type} (${data.place_name})`);
    }
    
    completed++;
    if (completed === testData.length) {
      console.log('\n🎉 모든 테스트 데이터 추가 완료!');
      db.close();
    }
  });
});

