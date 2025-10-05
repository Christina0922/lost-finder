import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "lostfinder.sqlite3");
sqlite3.verbose();
export const db = new sqlite3.Database(dbPath);

// 초기 스키마: users 테이블과 비번재설정 칼럼 보장
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 비밀번호 재설정용 컬럼 보강(없으면 추가)
  db.run(`PRAGMA table_info(users)`, (err) => {
    if (err) return;
    db.get(`PRAGMA table_info(users)`, () => {
      db.run(`ALTER TABLE users ADD COLUMN reset_token_hash TEXT`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN reset_token_expires TEXT`, () => {});
    });
  });
});
