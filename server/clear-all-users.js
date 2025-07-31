const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, 'users.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
    return;
  }
  
  console.log('✅ SQLite 데이터베이스 연결 성공');
  
  // 모든 사용자 삭제
  db.run('DELETE FROM users', [], function(err) {
    if (err) {
      console.error('❌ 사용자 삭제 실패:', err.message);
    } else {
      console.log(`✅ 모든 사용자 삭제 완료! (${this.changes}명 삭제됨)`);
      console.log('🎉 이제 깔끔하게 새로 시작할 수 있습니다!');
    }
    
    db.close();
  });
}); 