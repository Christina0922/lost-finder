const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// 좌표가 없는 항목들에 추가
const updates = [
  {
    id: 1,
    item_type: '자전거',
    location: '신림동길 20',
    lat: 37.4842,
    lng: 126.9292,
    place_name: '신림동',
    address: '서울특별시 관악구 신림동길 20'
  },
  {
    id: 2,
    item_type: '킥보드',
    location: '고려대학교 병원',
    lat: 37.5900,
    lng: 127.0265,
    place_name: '고려대학교병원',
    address: '서울특별시 성북구 안암로 73'
  },
  {
    id: 3,
    item_type: '택배',
    location: '한숲로 84 603동',
    lat: 37.6249,
    lng: 127.0789,
    place_name: '한숲로 84',
    address: '서울특별시 노원구 한숲로 84'
  }
];

let completed = 0;

updates.forEach((data) => {
  db.run(
    `UPDATE lost_items SET lat = ?, lng = ?, place_name = ?, address = ? WHERE id = ?`,
    [data.lat, data.lng, data.place_name, data.address, data.id],
    (err) => {
      if (err) {
        console.error(`❌ ID ${data.id} (${data.item_type}) 업데이트 실패:`, err.message);
      } else {
        console.log(`✅ ID ${data.id} (${data.item_type}) 좌표 추가 완료`);
        console.log(`   위치: ${data.place_name}`);
        console.log(`   좌표: ${data.lat}, ${data.lng}`);
      }
      
      completed++;
      if (completed === updates.length) {
        console.log('\n🎉 모든 분실물에 좌표 추가 완료!');
        console.log('이제 모든 항목에서 지도가 표시됩니다!');
        db.close();
      }
    }
  );
});

