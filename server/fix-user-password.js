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
const plainPassword = 'skinner1'; // 현재 비밀번호

// 먼저 password_hash 컬럼이 있는지 확인하고 없으면 추가
db.run('ALTER TABLE users ADD COLUMN password_hash TEXT', (err) => {
  // 컬럼이 이미 있으면 에러가 나지만 무시
  if (err && !err.message.includes('duplicate column')) {
    console.log('⚠️ password_hash 컬럼 추가 시도 (이미 있을 수 있음)');
  }
  
  // 사용자 조회
  db.get('SELECT id, email, password FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('❌ 사용자 조회 실패:', err.message);
      db.close();
      return;
    }
    
    if (!user) {
      console.log(`❌ ${email} 사용자를 찾을 수 없습니다.`);
      db.close();
      return;
    }
    
    console.log('🔍 현재 사용자 정보:');
    console.log(`   ID: ${user.id}`);
    console.log(`   이메일: ${user.email}`);
    console.log(`   현재 password 필드: ${user.password ? user.password.substring(0, 30) : '(없음)'}`);
    console.log('');
    
    // 비밀번호를 해시로 변환
    const passwordHash = hashPassword(plainPassword);
    console.log(`🔐 비밀번호 해시 생성: ${passwordHash.substring(0, 30)}...`);
    console.log('');
    
    // password_hash 필드 업데이트
    db.run(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, email],
      function(updateErr) {
        if (updateErr) {
          console.error('❌ 비밀번호 해시 업데이트 실패:', updateErr.message);
          db.close();
          return;
        }
        
        if (this.changes > 0) {
          console.log('✅ 비밀번호 해시 업데이트 성공!');
          console.log('');
          console.log('📧 이메일:', email);
          console.log('🔑 비밀번호:', plainPassword);
          console.log('💡 이제 이 비밀번호로 로그인할 수 있습니다!');
        } else {
          console.log('❌ 업데이트된 행이 없습니다.');
        }
        
        db.close();
      }
    );
  });
});
