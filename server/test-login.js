import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { hashPassword } from "./utils/hash.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "users.db");
sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

console.log('✅ SQLite 데이터베이스 연결 성공\n');

const email = 'yoonjeongc@gmail.com';
const password = 'skinner1';

// 비밀번호 해시 생성
const pwHash = hashPassword(password);
console.log('🔐 입력 비밀번호:', password);
console.log('🔐 생성된 해시:', pwHash);
console.log('');

// 데이터베이스에서 사용자 조회
db.get(
  `SELECT id, email, username, password_hash FROM users WHERE email=?`,
  [email],
  (err, user) => {
    if (err) {
      console.error('❌ DB 오류:', err.message);
      db.close();
      return;
    }
    
    if (!user) {
      console.log(`❌ ${email} 사용자를 찾을 수 없습니다.`);
      db.close();
      return;
    }
    
    console.log('📋 사용자 정보:');
    console.log(`   ID: ${user.id}`);
    console.log(`   이메일: ${user.email}`);
    console.log(`   이름: ${user.username || '(없음)'}`);
    console.log(`   저장된 해시: ${user.password_hash ? user.password_hash.substring(0, 30) + '...' : '(없음)'}`);
    console.log('');
    
    // 해시 비교
    if (user.password_hash === pwHash) {
      console.log('✅ 비밀번호 해시가 일치합니다!');
      console.log('✅ 로그인이 성공해야 합니다.');
    } else {
      console.log('❌ 비밀번호 해시가 일치하지 않습니다!');
      console.log(`   입력 해시: ${pwHash.substring(0, 30)}...`);
      console.log(`   저장 해시: ${user.password_hash ? user.password_hash.substring(0, 30) + '...' : '(없음)'}`);
      console.log('');
      console.log('💡 비밀번호 해시를 업데이트합니다...');
      
      // 해시 업데이트
      db.run(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [pwHash, email],
        function(updateErr) {
          if (updateErr) {
            console.error('❌ 업데이트 실패:', updateErr.message);
          } else {
            console.log('✅ 비밀번호 해시 업데이트 완료!');
          }
          db.close();
        }
      );
      return;
    }
    
    db.close();
  }
);

