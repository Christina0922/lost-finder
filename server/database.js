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
  const createUsersTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      isTemporaryPassword BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createLostItemsTableSQL = `
    CREATE TABLE IF NOT EXISTS lost_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      lat REAL,
      lng REAL,
      place_name TEXT,
      address TEXT,
      lost_at DATETIME,
      created_by_device_id TEXT,
      image_urls TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id)
    )
  `;

  const createCommentsTableSQL = `
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES lost_items (id),
      FOREIGN KEY (author_id) REFERENCES users (id)
    )
  `;

  db.run(createUsersTableSQL, (err) => {
    if (err) {
      console.error('❌ users 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ users 테이블 생성 완료');
      // 기존 테이블에 isTemporaryPassword 컬럼 추가
      db.run('ALTER TABLE users ADD COLUMN isTemporaryPassword BOOLEAN DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('❌ isTemporaryPassword 컬럼 추가 실패:', err.message);
        } else {
          console.log('✅ isTemporaryPassword 컬럼 확인 완료');
        }
      });
    }
  });

  db.run(createLostItemsTableSQL, (err) => {
    if (err) {
      console.error('❌ lost_items 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ lost_items 테이블 생성 완료');
      
      // 기존 테이블에 새 컬럼 추가 (마이그레이션)
      const addColumns = [
        { name: 'lat', type: 'REAL' },
        { name: 'lng', type: 'REAL' },
        { name: 'place_name', type: 'TEXT' },
        { name: 'address', type: 'TEXT' },
        { name: 'lost_at', type: 'DATETIME' },
        { name: 'created_by_device_id', type: 'TEXT' }
      ];
      
      addColumns.forEach(column => {
        db.run(`ALTER TABLE lost_items ADD COLUMN ${column.name} ${column.type}`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error(`❌ ${column.name} 컬럼 추가 실패:`, err.message);
          } else if (!err) {
            console.log(`✅ ${column.name} 컬럼 추가 완료`);
          }
        });
      });
    }
  });

  db.run(createCommentsTableSQL, (err) => {
    if (err) {
      console.error('❌ comments 테이블 생성 실패:', err.message);
    } else {
      console.log('✅ comments 테이블 생성 완료');
    }
  });
}

// 사용자 등록
function registerUser(userData) {
  return new Promise((resolve, reject) => {
    const { username, email, phone, password } = userData;
    const normalizedPhone = phone.replace(/-/g, '');
    
    const sql = `
      INSERT INTO users (username, email, phone, password)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(sql, [username, email, normalizedPhone, password], function(err) {
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
    const normalizedPhone = phone.replace(/-/g, '');
    const sql = 'SELECT * FROM users WHERE REPLACE(phone, "-", "") = ?';
    
    db.get(sql, [normalizedPhone], (err, row) => {
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

// ID로 사용자 조회
function findUserById(userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, username, email, phone, password, isTemporaryPassword, created_at FROM users WHERE id = ?';
    
    db.get(sql, [userId], (err, row) => {
      if (err) {
        reject(new Error('사용자 조회 중 오류가 발생했습니다.'));
      } else if (!row) {
        resolve(null);
      } else {
        resolve(row);
      }
    });
  });
}

// 임시 비밀번호 설정
function setTemporaryPassword(userId, tempPassword) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET password = ?, isTemporaryPassword = 1 WHERE id = ?';
    
    db.run(sql, [tempPassword, userId], function(err) {
      if (err) {
        reject(new Error('임시 비밀번호 설정 중 오류가 발생했습니다.'));
      } else if (this.changes === 0) {
        reject(new Error('사용자를 찾을 수 없습니다.'));
      } else {
        resolve({ message: '임시 비밀번호가 설정되었습니다.' });
      }
    });
  });
}

// 비밀번호 업데이트
function updatePassword(userId, newPassword) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET password = ?, isTemporaryPassword = 0 WHERE id = ?';
    
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
        // 핸드폰 번호 마스킹 처리
        const maskedUsers = rows.map(user => ({
          ...user,
          phone: maskPhoneNumber(user.phone)
        }));
        resolve(maskedUsers);
      }
    });
  });
}

// 핸드폰 번호 마스킹 함수
function maskPhoneNumber(phone) {
  if (!phone) return phone;
  
  // +82로 시작하는 경우 (한국 번호)
  if (phone.startsWith('+82')) {
    return phone.replace(/(\+82\d{1,2})\d{3,4}(\d{4})/, '$1****$2');
  }
  
  // 일반적인 전화번호 형식
  if (phone.length >= 10) {
    const start = phone.substring(0, 3);
    const end = phone.substring(phone.length - 4);
    return `${start}****${end}`;
  }
  
  // 짧은 번호는 그대로 반환
  return phone;
}

// 분실물 등록
function createLostItem(itemData) {
  return new Promise((resolve, reject) => {
    const { 
      author_id, 
      item_type, 
      description, 
      location, 
      lat, 
      lng, 
      place_name, 
      address, 
      lost_at,
      created_by_device_id,
      image_urls 
    } = itemData;
    const imageUrlsJson = image_urls ? JSON.stringify(image_urls) : null;
    
    const sql = `
      INSERT INTO lost_items (
        author_id, item_type, description, location, 
        lat, lng, place_name, address, lost_at, created_by_device_id, image_urls
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      author_id, 
      item_type, 
      description, 
      location, 
      lat || null, 
      lng || null, 
      place_name || null, 
      address || null, 
      lost_at || null,
      created_by_device_id || null,
      imageUrlsJson
    ], function(err) {
      if (err) {
        console.error('❌ 분실물 등록 실패:', err.message);
        reject(new Error('분실물 등록 중 오류가 발생했습니다.'));
      } else {
        resolve({
          id: this.lastID,
          author_id,
          item_type,
          description,
          location,
          lat,
          lng,
          place_name,
          address,
          lost_at,
          created_by_device_id,
          image_urls: image_urls || []
        });
      }
    });
  });
}

// 분실물 수정
function updateLostItem(itemId, itemData) {
  return new Promise((resolve, reject) => {
    const { 
      item_type, 
      description, 
      location, 
      lat, 
      lng, 
      place_name, 
      address, 
      lost_at,
      image_urls 
    } = itemData;
    const imageUrlsJson = image_urls ? JSON.stringify(image_urls) : null;
    
    const sql = `
      UPDATE lost_items 
      SET item_type = ?, description = ?, location = ?, 
          lat = ?, lng = ?, place_name = ?, address = ?, lost_at = ?,
          image_urls = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.run(sql, [
      item_type, 
      description, 
      location, 
      lat || null, 
      lng || null, 
      place_name || null, 
      address || null, 
      lost_at || null,
      imageUrlsJson, 
      itemId
    ], function(err) {
      if (err) {
        console.error('❌ 분실물 수정 실패:', err.message);
        reject(new Error('분실물 수정 중 오류가 발생했습니다.'));
      } else if (this.changes === 0) {
        reject(new Error('분실물을 찾을 수 없습니다.'));
      } else {
        resolve({ message: '분실물이 성공적으로 수정되었습니다.' });
      }
    });
  });
}

// 분실물 삭제
function deleteLostItem(itemId) {
  return new Promise((resolve, reject) => {
    // 먼저 관련 댓글들을 삭제
    const deleteCommentsSql = 'DELETE FROM comments WHERE item_id = ?';
    
    db.run(deleteCommentsSql, [itemId], (err) => {
      if (err) {
        reject(new Error('댓글 삭제 중 오류가 발생했습니다.'));
        return;
      }
      
      // 그 다음 분실물을 삭제
      const deleteItemSql = 'DELETE FROM lost_items WHERE id = ?';
      
      db.run(deleteItemSql, [itemId], function(err) {
        if (err) {
          reject(new Error('분실물 삭제 중 오류가 발생했습니다.'));
        } else if (this.changes === 0) {
          reject(new Error('분실물을 찾을 수 없습니다.'));
        } else {
          resolve({ message: '분실물이 성공적으로 삭제되었습니다.' });
        }
      });
    });
  });
}

// 모든 분실물 조회 (작성자 정보 포함)
function getAllLostItems() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        li.id,
        li.item_type,
        li.description,
        li.location,
        li.lat,
        li.lng,
        li.place_name,
        li.address,
        li.lost_at,
        li.created_by_device_id,
        li.image_urls,
        li.created_at,
        li.updated_at,
        u.id as author_id,
        u.username as author_name,
        u.email as author_email
      FROM lost_items li
      JOIN users u ON li.author_id = u.id
      ORDER BY li.created_at DESC
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('❌ 분실물 목록 조회 실패:', err.message);
        reject(new Error('분실물 목록 조회 중 오류가 발생했습니다.'));
      } else {
        // image_urls를 JSON에서 배열로 변환
        const items = rows.map(row => ({
          ...row,
          image_urls: row.image_urls ? JSON.parse(row.image_urls) : []
        }));
        resolve(items);
      }
    });
  });
}

// 특정 분실물 조회
function getLostItemById(itemId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        li.id,
        li.item_type,
        li.description,
        li.location,
        li.lat,
        li.lng,
        li.place_name,
        li.address,
        li.lost_at,
        li.created_by_device_id,
        li.image_urls,
        li.created_at,
        li.updated_at,
        u.id as author_id,
        u.username as author_name,
        u.email as author_email
      FROM lost_items li
      JOIN users u ON li.author_id = u.id
      WHERE li.id = ?
    `;
    
    db.get(sql, [itemId], (err, row) => {
      if (err) {
        console.error('❌ 분실물 조회 실패:', err.message);
        reject(new Error('분실물 조회 중 오류가 발생했습니다.'));
      } else if (!row) {
        reject(new Error('분실물을 찾을 수 없습니다.'));
      } else {
        // image_urls를 JSON에서 배열로 변환
        const item = {
          ...row,
          image_urls: row.image_urls ? JSON.parse(row.image_urls) : []
        };
        resolve(item);
      }
    });
  });
}

// 댓글 등록
function createComment(commentData) {
  return new Promise((resolve, reject) => {
    const { item_id, author_id, text } = commentData;
    
    const sql = `
      INSERT INTO comments (item_id, author_id, text)
      VALUES (?, ?, ?)
    `;
    
    db.run(sql, [item_id, author_id, text], function(err) {
      if (err) {
        reject(new Error('댓글 등록 중 오류가 발생했습니다.'));
      } else {
        resolve({
          id: this.lastID,
          item_id,
          author_id,
          text
        });
      }
    });
  });
}

// 댓글 삭제
function deleteComment(commentId, authorId) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM comments WHERE id = ? AND author_id = ?';
    
    db.run(sql, [commentId, authorId], function(err) {
      if (err) {
        reject(new Error('댓글 삭제 중 오류가 발생했습니다.'));
      } else if (this.changes === 0) {
        reject(new Error('댓글을 찾을 수 없거나 삭제 권한이 없습니다.'));
      } else {
        resolve({ message: '댓글이 성공적으로 삭제되었습니다.' });
      }
    });
  });
}

// 특정 분실물의 모든 댓글 조회
function getCommentsByItemId(itemId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        c.id,
        c.text,
        c.created_at,
        u.id as author_id,
        u.username as author_name,
        u.email as author_email
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.item_id = ?
      ORDER BY c.created_at ASC
    `;
    
    db.all(sql, [itemId], (err, rows) => {
      if (err) {
        reject(new Error('댓글 목록 조회 중 오류가 발생했습니다.'));
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
  findUserById,
  setTemporaryPassword,
  updatePassword,
  getAllUsers,
  createLostItem,
  updateLostItem,
  deleteLostItem,
  getAllLostItems,
  getLostItemById,
  createComment,
  deleteComment,
  getCommentsByItemId
}; 