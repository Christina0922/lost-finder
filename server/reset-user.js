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
    resetUserPassword();
  }
});

// 사용자 비밀번호 리셋
function resetUserPassword() {
  const email = 'yoonjeongc@gmail.com';
  const newPassword = '123456'; // 6자 이상으로 변경
  
  const sql = 'UPDATE users SET password = ? WHERE email = ?';
  
  db.run(sql, [newPassword, email], function(err) {
    if (err) {
      console.error('❌ 비밀번호 업데이트 실패:', err.message);
    } else {
      if (this.changes > 0) {
        console.log('✅ 비밀번호 업데이트 성공!');
        console.log('📧 이메일:', email);
        console.log('🔑 새 비밀번호:', newPassword);
        console.log('💡 이제 이 비밀번호로 로그인하세요!');
      } else {
        console.log('❌ 해당 이메일의 사용자를 찾을 수 없습니다.');
      }
    }
    db.close();
  });
} 