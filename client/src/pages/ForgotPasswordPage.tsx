import React, { useState } from "react";
import { AuthAPI } from "../utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthAPI.requestReset(email.trim());
      setSent(true); // 존재여부와 관계없이 성공 처리
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, margin: "24px auto" }}>
      <h2>비밀번호 재설정</h2>
      {sent ? (
        <p>
          입력하신 이메일로 재설정 링크를 보냈습니다.
          <br />
          메일함을 확인해 주세요.
        </p>
      ) : (
        <form onSubmit={onSubmit}>
          <label style={{ display: "block", marginBottom: 8 }}>이메일</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
          />
          {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading || !email}
            style={{ width: "100%", padding: 12, background: "#ef4444", color: "#fff", border: 0, borderRadius: 8 }}
          >
            {loading ? "전송 중..." : "재설정 링크 보내기"}
          </button>
        </form>
      )}
    </div>
  );
}
