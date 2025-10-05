import React, { useEffect, useState } from "react";
import { AuthAPI } from "../utils/api";

function useQuery() {
  return new URLSearchParams(window.location.search);
}

export default function ResetPasswordPage() {
  const q = useQuery();
  const email = q.get("email") || "";
  const token = q.get("token") || "";

  const [valid, setValid] = useState<boolean | null>(null);
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const r = await AuthAPI.verifyResetToken(email, token);
        setValid(r.valid === true);
      } catch {
        setValid(false);
      }
    }
    if (email && token) verify();
    else setValid(false);
  }, [email, token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!newPw || newPw !== newPw2) {
      setErr("비밀번호가 일치하지 않습니다.");
      return;
    }
    setBusy(true);
    try {
      await AuthAPI.resetPassword(email, token, newPw);
      setMsg("비밀번호가 변경되었습니다. 이제 로그인 페이지에서 새 비밀번호로 로그인하세요.");
    } catch (e: any) {
      setErr(e.message || "변경 실패");
    } finally {
      setBusy(false);
    }
  };

  if (valid === null) return <div style={{ padding: 24 }}>검증 중...</div>;
  if (valid === false) return <div style={{ padding: 24, color: "crimson" }}>링크가 유효하지 않거나 만료되었습니다.</div>;

  return (
    <div className="container" style={{ maxWidth: 420, margin: "24px auto" }}>
      <h2>새 비밀번호 설정</h2>
      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>새 비밀번호</label>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          required
          style={{ width: "100%", padding: 12, marginBottom: 12 }}
        />
        <label style={{ display: "block", marginBottom: 8 }}>새 비밀번호 확인</label>
        <input
          type="password"
          value={newPw2}
          onChange={(e) => setNewPw2(e.target.value)}
          required
          style={{ width: "100%", padding: 12, marginBottom: 12 }}
        />
        {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
        {msg && <div style={{ color: "green", marginBottom: 8 }}>{msg}</div>}
        <button
          type="submit"
          disabled={busy}
          style={{ width: "100%", padding: 12, background: "#2563eb", color: "#fff", border: 0, borderRadius: 8 }}
        >
          {busy ? "저장 중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
}
