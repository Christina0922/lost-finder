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
  
  // yoonjeongc@gmail.com 사용자의 비밀번호 확인
  db.get('SELECT id, username, email, phone, password FROM users WHERE email = ?', ['yoonjeongc@gmail.com'], (err, row) => {
    if (err) {
      console.error('❌ 사용자 조회 실패:', err.message);
    } else if (!row) {
      console.log('❌ yoonjeongc@gmail.com 사용자를 찾을 수 없습니다.');
    } else {
      console.log('\n🔍 사용자 비밀번호 정보:');
      console.log('='.repeat(50));
      console.log(`ID: ${row.id}`);
      console.log(`사용자명: ${row.username}`);
      console.log(`이메일: ${row.email}`);
      console.log(`전화번호: ${row.phone}`);
      console.log(`저장된 비밀번호: ${row.password}`);
      console.log('='.repeat(50));
      
      // 비밀번호가 1234인지 확인
      if (row.password === '1234') {
        console.log('✅ 비밀번호가 1234와 일치합니다!');
      } else {
        console.log('❌ 비밀번호가 1234와 일치하지 않습니다.');
        console.log(`실제 저장된 비밀번호: "${row.password}"`);
      }
    }
    
    db.close();
  });
}); 