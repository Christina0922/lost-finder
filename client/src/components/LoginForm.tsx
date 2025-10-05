// C:\LostFinderProject\client\src\components\LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../utils/api';

type Props = {
  onLogin: (user: any) => void;
};

const LoginForm: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const data = await AuthAPI.login(email.trim(), pw);
      onLogin(data.user);      // 상위(App) 상태 업데이트
      navigate('/', { replace: true }); // ✅ 로그인 성공 시 홈으로 이동
    } catch (e: any) {
      setErr(e.message || '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 420, margin: '0 auto' }}>
      <label style={{ display: 'block', marginBottom: 8 }}>이메일</label>
      <input
        type="email"
        placeholder="example@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      />

      <label style={{ display: 'block', marginBottom: 8 }}>비밀번호</label>
      <input
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        required
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      />

      {err && <div style={{ color: 'crimson', marginBottom: 8 }}>{err}</div>}

      <button
        type="submit"
        disabled={busy}
        style={{ width: '100%', padding: 12, background: '#ef4444', color: '#fff', border: 0, borderRadius: 8 }}
      >
        {busy ? '로그인 중…' : '로그인'}
      </button>
    </form>
  );
};

export default LoginForm;
