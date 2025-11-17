import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 게임 데이터베이스 파일 경로
const gameDbPath = path.join(__dirname, "game.db");
sqlite3.verbose();
export const gameDb = new sqlite3.Database(gameDbPath);

// 게임 데이터베이스 초기화
gameDb.serialize(() => {
  // users 테이블에 코인 컬럼 추가 (기존 users.db와 동기화 필요)
  // game.db에 users_profile 테이블로 코인 관리
  gameDb.run(`
    CREATE TABLE IF NOT EXISTS users_profile (
      user_id INTEGER PRIMARY KEY,
      coins INTEGER DEFAULT 100,
      ads_removed BOOLEAN DEFAULT 0,
      subscription_active BOOLEAN DEFAULT 0,
      subscription_expires TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 한글 맞춤법 퍼즐 테이블
  gameDb.run(`
    CREATE TABLE IF NOT EXISTS korean_spelling_puzzles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      option1 TEXT NOT NULL,
      option2 TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      difficulty INTEGER DEFAULT 1,
      category TEXT DEFAULT 'general',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 영어 단어 순서 퍼즐 테이블
  gameDb.run(`
    CREATE TABLE IF NOT EXISTS english_word_order_puzzles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      korean_sentence TEXT NOT NULL,
      english_words TEXT NOT NULL,
      correct_order TEXT NOT NULL,
      difficulty INTEGER DEFAULT 1,
      category TEXT DEFAULT 'general',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 사용자 진행 상황 테이블
  gameDb.run(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      puzzle_type TEXT NOT NULL,
      puzzle_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT 0,
      score INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, puzzle_type, puzzle_id)
    )
  `);

  // 인앱 결제 기록 테이블
  gameDb.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      purchase_type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      payment_method TEXT,
      transaction_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 힌트 사용 기록 테이블
  gameDb.run(`
    CREATE TABLE IF NOT EXISTS hint_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      puzzle_type TEXT NOT NULL,
      puzzle_id INTEGER NOT NULL,
      coins_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log("✅ 게임 데이터베이스 초기화 완료");
});

// 사용자 프로필 가져오기 또는 생성
export function getUserProfile(userId) {
  return new Promise((resolve, reject) => {
    gameDb.get(
      "SELECT * FROM users_profile WHERE user_id = ?",
      [userId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row) {
          resolve(row);
        } else {
          // 프로필이 없으면 생성
          gameDb.run(
            "INSERT INTO users_profile (user_id, coins) VALUES (?, 100)",
            [userId],
            function (insertErr) {
              if (insertErr) {
                reject(insertErr);
                return;
              }
              // 생성된 프로필 반환
              gameDb.get(
                "SELECT * FROM users_profile WHERE user_id = ?",
                [userId],
                (selectErr, newRow) => {
                  if (selectErr) {
                    reject(selectErr);
                  } else {
                    resolve(newRow);
                  }
                }
              );
            }
          );
        }
      }
    );
  });
}

// 코인 업데이트
export function updateUserCoins(userId, coins) {
  return new Promise((resolve, reject) => {
    gameDb.run(
      "UPDATE users_profile SET coins = ?, updated_at = datetime('now') WHERE user_id = ?",
      [coins, userId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
}

// 코인 추가 (보상)
export function addCoins(userId, amount) {
  return new Promise((resolve, reject) => {
    getUserProfile(userId)
      .then((profile) => {
        const newCoins = profile.coins + amount;
        return updateUserCoins(userId, newCoins);
      })
      .then(() => getUserProfile(userId))
      .then(resolve)
      .catch(reject);
  });
}

// 코인 사용 (힌트 등)
export function useCoins(userId, amount) {
  return new Promise((resolve, reject) => {
    getUserProfile(userId)
      .then((profile) => {
        if (profile.coins < amount) {
          reject(new Error("코인이 부족합니다."));
          return;
        }
        const newCoins = profile.coins - amount;
        return updateUserCoins(userId, newCoins);
      })
      .then(() => getUserProfile(userId))
      .then(resolve)
      .catch(reject);
  });
}

// 한글 맞춤법 퍼즐 가져오기
export function getKoreanPuzzle(puzzleId = null) {
  return new Promise((resolve, reject) => {
    if (puzzleId) {
      gameDb.get(
        "SELECT * FROM korean_spelling_puzzles WHERE id = ?",
        [puzzleId],
        (err, row) => {
          if (err) {
            console.error('한글 퍼즐 조회 오류:', err);
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    } else {
      // 랜덤 퍼즐 가져오기
      gameDb.get(
        "SELECT * FROM korean_spelling_puzzles ORDER BY RANDOM() LIMIT 1",
        [],
        (err, row) => {
          if (err) {
            console.error('한글 퍼즐 조회 오류:', err);
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    }
  });
}

// 영어 단어 순서 퍼즐 가져오기
export function getEnglishPuzzle(puzzleId = null) {
  return new Promise((resolve, reject) => {
    if (puzzleId) {
      gameDb.get(
        "SELECT * FROM english_word_order_puzzles WHERE id = ?",
        [puzzleId],
        (err, row) => {
          if (err) {
            console.error('영어 퍼즐 조회 오류:', err);
            reject(err);
          } else {
            if (row) {
              try {
                // JSON 문자열을 배열로 변환
                row.english_words = JSON.parse(row.english_words);
                row.correct_order = JSON.parse(row.correct_order);
              } catch (parseErr) {
                console.error('JSON 파싱 오류:', parseErr);
                reject(parseErr);
                return;
              }
            }
            resolve(row || null);
          }
        }
      );
    } else {
      // 랜덤 퍼즐 가져오기
      gameDb.get(
        "SELECT * FROM english_word_order_puzzles ORDER BY RANDOM() LIMIT 1",
        [],
        (err, row) => {
          if (err) {
            console.error('영어 퍼즐 조회 오류:', err);
            reject(err);
          } else {
            if (row) {
              try {
                row.english_words = JSON.parse(row.english_words);
                row.correct_order = JSON.parse(row.correct_order);
              } catch (parseErr) {
                console.error('JSON 파싱 오류:', parseErr);
                reject(parseErr);
                return;
              }
            }
            resolve(row || null);
          }
        }
      );
    }
  });
}

// 진행 상황 저장
export function saveProgress(userId, puzzleType, puzzleId, completed, score) {
  return new Promise((resolve, reject) => {
    gameDb.run(
      `INSERT OR REPLACE INTO user_progress 
       (user_id, puzzle_type, puzzle_id, completed, score, attempts, completed_at)
       VALUES (?, ?, ?, ?, ?, 
         COALESCE((SELECT attempts FROM user_progress WHERE user_id = ? AND puzzle_type = ? AND puzzle_id = ?), 0) + 1,
         CASE WHEN ? = 1 THEN datetime('now') ELSE completed_at END)
       `,
      [userId, puzzleType, puzzleId, completed ? 1 : 0, score, userId, puzzleType, puzzleId, completed ? 1 : 0],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

// 힌트 사용 기록
export function recordHintUsage(userId, puzzleType, puzzleId, coinsUsed) {
  return new Promise((resolve, reject) => {
    gameDb.run(
      "INSERT INTO hint_usage (user_id, puzzle_type, puzzle_id, coins_used) VALUES (?, ?, ?, ?)",
      [userId, puzzleType, puzzleId, coinsUsed],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

// 구매 기록 저장
export function recordPurchase(userId, purchaseType, amount, itemName, transactionId = null) {
  return new Promise((resolve, reject) => {
    gameDb.run(
      `INSERT INTO purchases (user_id, purchase_type, amount, item_name, transaction_id, status)
       VALUES (?, ?, ?, ?, ?, 'completed')`,
      [userId, purchaseType, amount, itemName, transactionId || `txn_${Date.now()}`],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

// 광고 제거 구매
export function purchaseAdRemoval(userId, amount = 5900) {
  return new Promise((resolve, reject) => {
    recordPurchase(userId, "ad_removal", amount, "광고 제거")
      .then(() => {
        return new Promise((res, rej) => {
          gameDb.run(
            "UPDATE users_profile SET ads_removed = 1, updated_at = datetime('now') WHERE user_id = ?",
            [userId],
            function (err) {
              if (err) rej(err);
              else res();
            }
          );
        });
      })
      .then(() => getUserProfile(userId))
      .then(resolve)
      .catch(reject);
  });
}

// 코인 구매
export function purchaseCoins(userId, coinAmount, amount) {
  return new Promise((resolve, reject) => {
    recordPurchase(userId, "coins", amount, `${coinAmount} 코인`)
      .then(() => addCoins(userId, coinAmount))
      .then(resolve)
      .catch(reject);
  });
}

