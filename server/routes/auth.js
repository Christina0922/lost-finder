import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import { db } from "../db.js";
import { hashPassword, hashToken } from "../utils/hash.js";
import { sendResetEmail } from "../utils/mailer.js";

dotenv.config();
const router = express.Router();

// 로그인 (참고용 — 기존 로그인 로직 유지에 맞춰 사용하세요)
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const pwHash = hashPassword(password || "");
  db.get(
    `SELECT id, email, name FROM users WHERE email=? AND password_hash=?`,
    [email, pwHash],
    (err, row) => {
      if (err) return res.status(500).json({ message: "DB 오류" });
      if (!row) return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      return res.json({ user: row });
    }
  );
});

// 1) 비밀번호 재설정 요청 (이메일 입력만)
router.post("/request-reset", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "이메일을 입력하세요." });

  db.get(`SELECT id FROM users WHERE email=?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: "DB 오류" });

    // 보안상 존재여부를 노출하지 않음(항상 성공 응답)
    if (!user) {
      return res.json({ ok: true });
    }

    try {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + (Number(process.env.RESET_TOKEN_EXP_MINUTES || 60) * 60 * 1000)).toISOString();

      db.run(
        `UPDATE users SET reset_token_hash=?, reset_token_expires=? WHERE id=?`,
        [tokenHash, expiresAt, user.id],
        async (uErr) => {
          if (uErr) return res.status(500).json({ message: "DB 업데이트 오류" });

          const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
          const resetLink = `${clientOrigin}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

          await sendResetEmail(email, resetLink);
          return res.json({ ok: true });
        }
      );
    } catch (e) {
      return res.status(500).json({ message: "메일 발송 실패" });
    }
  });
});

// 2) 토큰 검증
router.post("/verify-reset-token", (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ message: "잘못된 요청" });

  const tokenHash = hashToken(token);
  db.get(
    `SELECT id, reset_token_expires FROM users WHERE email=? AND reset_token_hash=?`,
    [email, tokenHash],
    (err, row) => {
      if (err) return res.status(500).json({ message: "DB 오류" });
      if (!row) return res.status(400).json({ valid: false });

      const now = new Date();
      const exp = new Date(row.reset_token_expires);
      if (isNaN(exp.getTime()) || now > exp) {
        return res.status(400).json({ valid: false, message: "토큰이 만료되었습니다." });
      }
      return res.json({ valid: true });
    }
  );
});

// 3) 실제 비밀번호 변경
router.post("/reset-password", (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ message: "필수 항목 누락" });

  const tokenHash = hashToken(token);
  db.get(
    `SELECT id, reset_token_expires FROM users WHERE email=? AND reset_token_hash=?`,
    [email, tokenHash],
    (err, user) => {
      if (err) return res.status(500).json({ message: "DB 오류" });
      if (!user) return res.status(400).json({ message: "토큰이 유효하지 않습니다." });

      const now = new Date();
      const exp = new Date(user.reset_token_expires);
      if (isNaN(exp.getTime()) || now > exp) {
        return res.status(400).json({ message: "토큰이 만료되었습니다." });
      }

      const newHash = hashPassword(newPassword);
      db.run(
        `UPDATE users SET password_hash=?, reset_token_hash=NULL, reset_token_expires=NULL WHERE id=?`,
        [newHash, user.id],
        (uErr) => {
          if (uErr) return res.status(500).json({ message: "비밀번호 변경 실패" });
          return res.json({ ok: true });
        }
      );
    }
  );
});

export default router;
