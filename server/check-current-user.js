import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "users.db");
sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

console.log('✅ SQLite 데이터베이스 연결 성공\n');

// 모든 사용자 조회 (스키마에 맞게 조회)
db.all('SELECT * FROM users', [], (err, rows) => {
  if (err) {
    console.error('❌ 사용자 조회 실패:', err.message);
    db.close();
    return;
  }
  
  console.log('📋 등록된 사용자 목록:');
  console.log('='.repeat(60));
  
  if (rows.length === 0) {
    console.log('등록된 사용자가 없습니다.');
  } else {
    rows.forEach((user, index) => {
      console.log(`\n${index + 1}. 사용자 정보:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   이메일: ${user.email || '(없음)'}`);
      console.log(`   이름: ${user.name || user.username || '(없음)'}`);
      const passwordField = user.password_hash || user.password || '(없음)';
      console.log(`   비밀번호 해시: ${passwordField && passwordField !== '(없음)' ? passwordField.substring(0, 20) + '...' : '(없음)'}`);
      console.log(`   가입일: ${user.created_at || '(없음)'}`);
      console.log('   전체 필드:', Object.keys(user).join(', '));
      console.log('-'.repeat(60));
    });
  }
  
  console.log(`\n총 ${rows.length}명의 사용자가 등록되어 있습니다.`);
  console.log('\n💡 비밀번호는 해시로 저장되어 있어 원본을 확인할 수 없습니다.');
  console.log('💡 비밀번호를 재설정하려면 reset-user-password.js 스크립트를 사용하세요.');
  
  db.close();
});

