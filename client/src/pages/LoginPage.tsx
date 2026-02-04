import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ThemeMode, AuthLoginHandler } from "../App";

type LoginPageProps = {
  onLogin: AuthLoginHandler;
  theme: ThemeMode;
};

export default function LoginPage({ onLogin, theme }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const ok = await onLogin(email.trim(), password);
      if (!ok) {
        setErrorMsg("로그인에 실패했습니다. 이메일/비밀번호를 확인해 주세요.");
        return;
      }
      navigate("/", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>로그인</h2>

      <form onSubmit={submit} style={{ maxWidth: 360 }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", marginBottom: 6 }}>이메일</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", marginBottom: 6 }}>비밀번호</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>

        {errorMsg ? (
          <div style={{ marginBottom: 10, color: "crimson", fontSize: 14 }}>{errorMsg}</div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "처리 중..." : "로그인"}
        </button>

        <div style={{ marginTop: 12, fontSize: 14, opacity: 0.85 }}>
          현재 테마: {theme}
        </div>
      </form>
    </div>
  );
}
