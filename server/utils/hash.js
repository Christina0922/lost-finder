import CryptoJS from "crypto-js";

// 비밀번호 해시 (예시: SHA256) — 실제 서비스에서는 bcrypt 권장
export function hashPassword(plain) {
  return CryptoJS.SHA256(plain).toString();
}

// 토큰(원문)을 DB에는 해시로 저장
export function hashToken(token) {
  return CryptoJS.SHA256(token).toString();
}
