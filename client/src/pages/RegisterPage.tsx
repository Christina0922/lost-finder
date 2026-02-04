import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ThemeMode, AuthLoginHandler } from "../App";

type RegisterPageProps = {
  onLogin: AuthLoginHandler;
  theme: ThemeMode;
};

export default function RegisterPage({ onLogin, theme }: RegisterPageProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMsg("이메일을 입력해 주세요.");
      return;
    }
    if (!password) {
      setErrorMsg("비밀번호를 입력해 주세요.");
      return;
    }
    if (password.length < 4) {
      setErrorMsg("비밀번호는 4자 이상으로 입력해 주세요.");
      return;
    }
    if (password !== password2) {
      setErrorMsg("비밀번호가 서로 다릅니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ 최소 동작: 가입 후 즉시 로그인 처리
      const ok = await onLogin(trimmedEmail, password);
      if (!ok) {
        setErrorMsg("회원가입 처리에 실패했습니다. 입력값을 확인해 주세요.");
        return;
      }
      navigate("/", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>회원가입</h2>

      <form onSubmit={submit} style={{ maxWidth: 360 }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", marginBottom: 6 }}>이메일</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", marginBottom: 6 }}>비밀번호</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", marginBottom: 6 }}>비밀번호 확인</label>
          <input
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호 확인"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {errorMsg ? (
          <div style={{ marginBottom: 10, color: "crimson", fontSize: 14 }}>
            {errorMsg}
          </div>
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
          {isSubmitting ? "처리 중..." : "가입하고 시작하기"}
        </button>

        <div style={{ marginTop: 12, fontSize: 14, opacity: 0.85 }}>
          현재 테마: {theme}
        </div>
      </form>
    </div>
  );
}
