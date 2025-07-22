const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, 'users.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
    process.exit(1);
  } else {
    console.log('✅ SQLite 데이터베이스 연결 성공');
    deleteAllUsers();
  }
});

// 모든 사용자 삭제
function deleteAllUsers() {
  const sql = 'DELETE FROM users';
  
  db.run(sql, function(err) {
    if (err) {
      console.error('❌ 사용자 삭제 실패:', err.message);
    } else {
      console.log('✅ 모든 사용자 삭제 완료!');
      console.log(`🗑️ 삭제된 사용자 수: ${this.changes}명`);
      console.log('💡 이제 새로운 사용자로 등록하세요!');
    }
    db.close();
  });
} 