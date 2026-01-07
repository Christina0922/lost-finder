const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// 정확한 좌표로 업데이트
const updates = [
  {
    id: 4,
    lat: 37.5900,
    lng: 127.0265,
    place_name: '고려대학교병원',
    address: '서울특별시 성북구 안암로 73'
  },
  {
    id: 5,
    lat: 37.4975,
    lng: 127.0274,
    place_name: '남사중학교',
    address: '서울특별시 서초구 남부순환로 2635'
  },
  {
    id: 6,
    lat: 37.4979,
    lng: 127.0276,
    place_name: '강남역',
    address: '서울특별시 강남구 역삼동'
  }
];

let completed = 0;
updates.forEach((data) => {
  db.run(
    `UPDATE lost_items SET lat = ?, lng = ?, place_name = ?, address = ? WHERE id = ?`,
    [data.lat, data.lng, data.place_name, data.address, data.id],
    (err) => {
      if (err) {
        console.error(`❌ ID ${data.id} 업데이트 실패:`, err.message);
      } else {
        console.log(`✅ ID ${data.id} (${data.place_name}) 좌표 업데이트 완료`);
      }
      
      completed++;
      if (completed === updates.length) {
        console.log('\n🎉 모든 좌표 업데이트 완료!');
        db.close();
      }
    }
  );
});

