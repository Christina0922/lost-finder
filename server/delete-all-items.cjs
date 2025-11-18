const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 데이터베이스 연결 성공');
    deleteAllItems();
  }
});

function deleteAllItems() {
  // 먼저 모든 댓글 삭제
  db.run('DELETE FROM comments', (err) => {
    if (err) {
      console.error('❌ 댓글 삭제 실패:', err.message);
    } else {
      console.log('✅ 모든 댓글 삭제 완료');
    }
    
    // 그 다음 모든 분실물 삭제
    db.run('DELETE FROM lost_items', (err) => {
      if (err) {
        console.error('❌ 분실물 삭제 실패:', err.message);
      } else {
        console.log('✅ 모든 분실물 삭제 완료');
      }
      
      // 삭제된 항목 수 확인
      db.get('SELECT COUNT(*) as count FROM lost_items', (err, row) => {
        if (err) {
          console.error('❌ 확인 실패:', err.message);
        } else {
          console.log(`📊 현재 분실물 개수: ${row.count}개`);
        }
        
        db.close((err) => {
          if (err) {
            console.error('❌ 데이터베이스 닫기 실패:', err.message);
          } else {
            console.log('✅ 데이터베이스 닫기 완료');
          }
          process.exit(0);
        });
      });
    });
  });
}

