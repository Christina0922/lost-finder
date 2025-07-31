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
  
  // 모든 사용자 조회
  db.all('SELECT id, username, email, phone, created_at FROM users', [], (err, rows) => {
    if (err) {
      console.error('❌ 사용자 조회 실패:', err.message);
    } else {
      console.log('\n📋 등록된 사용자 목록:');
      console.log('='.repeat(60));
      
      if (rows.length === 0) {
        console.log('등록된 사용자가 없습니다.');
      } else {
        rows.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}`);
          console.log(`   사용자명: ${user.username}`);
          console.log(`   이메일: ${user.email}`);
          console.log(`   전화번호: ${user.phone}`);
          console.log(`   가입일: ${user.created_at}`);
          console.log('-'.repeat(40));
        });
      }
      
      console.log(`\n총 ${rows.length}명의 사용자가 등록되어 있습니다.`);
    }
    
    db.close();
  });
}); 