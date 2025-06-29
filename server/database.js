const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, 'users.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
  } else {
    console.log('✅ SQLite 데이터베이스 연결 성공');
    initDatabase();
  }
});

// 데이터베이스 초기화 (테이블 생성)
function initDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('❌ 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ users 테이블 생성 완료');
    }
  });
}

// 사용자 등록
function registerUser(userData) {
  return new Promise((resolve, reject) => {
    const { username, email, phone, password } = userData;
    
    const sql = `
      INSERT INTO users (username, email, phone, password)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(sql, [username, email, phone, password], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          if (err.message.includes('username')) {
            reject(new Error('이미 사용 중인 사용자명입니다.'));
          } else if (err.message.includes('email')) {
            reject(new Error('이미 사용 중인 이메일입니다.'));
          } else if (err.message.includes('phone')) {
            reject(new Error('이미 사용 중인 전화번호입니다.'));
          }
        } else {
          reject(new Error('사용자 등록 중 오류가 발생했습니다.'));
        }
      } else {
        resolve({
          id: this.lastID,
          username,
          email,
          phone
        });
      }
    });
  });
}

// 전화번호로 사용자 찾기
function findUserByPhone(phone) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE phone = ?';
    
    db.get(sql, [phone], (err, row) => {
      if (err) {
        reject(new Error('사용자 검색 중 오류가 발생했습니다.'));
      } else if (!row) {
        reject(new Error('등록되지 않은 전화번호입니다.'));
      } else {
        resolve(row);
      }
    });
  });
}

// 이메일로 사용자 찾기
function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(new Error('사용자 검색 중 오류가 발생했습니다.'));
      } else if (!row) {
        reject(new Error('등록되지 않은 이메일입니다.'));
      } else {
        resolve(row);
      }
    });
  });
}

// 사용자명으로 사용자 찾기
function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(new Error('사용자 검색 중 오류가 발생했습니다.'));
      } else if (!row) {
        reject(new Error('등록되지 않은 사용자명입니다.'));
      } else {
        resolve(row);
      }
    });
  });
}

// 비밀번호 업데이트
function updatePassword(userId, newPassword) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    
    db.run(sql, [newPassword, userId], function(err) {
      if (err) {
        reject(new Error('비밀번호 업데이트 중 오류가 발생했습니다.'));
      } else if (this.changes === 0) {
        reject(new Error('사용자를 찾을 수 없습니다.'));
      } else {
        resolve({ message: '비밀번호가 성공적으로 변경되었습니다.' });
      }
    });
  });
}

// 모든 사용자 조회 (개발용)
function getAllUsers() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, username, email, phone, created_at FROM users';
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(new Error('사용자 목록 조회 중 오류가 발생했습니다.'));
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  registerUser,
  findUserByPhone,
  findUserByEmail,
  findUserByUsername,
  updatePassword,
  getAllUsers
}; 