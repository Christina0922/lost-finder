// C:\LostFinderProject\client\src\utils\api.ts
export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (window as any).REACT_APP_API_BASE_URL ||
  (process.env as any).REACT_APP_API_BASE_URL ||
  "http://172.30.1.44:5000";

// 공통 요청 유틸 (기본적으로 캐시 방지)
async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
    cache: "no-store",           // ✅ 캐시 사용 금지
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "요청 실패");
  return data;
}

/** 분실물 전체 목록 */
export async function getAllLostItems() {
  // ✅ 캐시 무력화 & 최신 목록 보장(쿼리 스트링에 타임스탬프 추가)
  const ts = Date.now();
  const res = await fetch(`${API_BASE}/lost?ts=${ts}`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(data?.message || "목록 조회 실패");
  return Array.isArray(data) ? data : [];
}

/** 분실물 등록 */
export async function createLostItem(payload: any) {
  const url = `${API_BASE}/lost`;
  
  // FormData인지 확인
  if (payload instanceof FormData) {
    const res = await fetch(url, {
      method: "POST",
      body: payload,
      credentials: "include",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "등록 실패");
    return data;
  } else {
    // 기존 JSON 방식
    return request("/lost", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

/** 단건 조회 */
export async function getLostItemById(id: string | number) {
  return request(`/lost/${id}`, { method: "GET" });
}

/** 댓글 추가 */
export async function addComment(itemId: string | number, payload: any) {
  return request(`/lost/${itemId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** 삭제 (이전 답변에서 안내한 그대로 유지) */
export async function deleteLostItem(id: string | number) {
  try {
    const res = await fetch(`${API_BASE}/lost/${id}`, {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) return true;
  } catch {}
  const res2 = await fetch(`${API_BASE}/lost/${id}/delete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    cache: "no-store",
  });
  if (!res2.ok) {
    const data = await res2.json().catch(() => ({}));
    throw new Error(data?.message || "삭제 실패");
  }
  return true;
}

// 기존 API들도 유지 (호환성을 위해)
export const AuthAPI = {
  login: (email: string, password: string) =>
    request("/api/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  requestReset: (email: string) =>
    request("/auth/request-reset", { method: "POST", body: JSON.stringify({ email }) }),

  verifyResetToken: (email: string, token: string) =>
    request("/api/forgot-password/verify", {
      method: "POST",
      body: JSON.stringify({ email, token })
    }),

  resetPassword: (email: string, token: string, newPassword: string) =>
    request("/api/forgot-password/reset", {
      method: "POST",
      body: JSON.stringify({ email, token, newPassword })
    }),

  me: () => request("/api/me"),
};

export const checkServerHealth = () => request("/api/health");

// 기존 함수들도 유지 (호환성을 위해)
export const addLostItem = createLostItem;
export const updateLostItem = (id: string, item: any) => request(`/lost/${id}`, { method: "PUT", body: JSON.stringify(item) });

export const changePassword = (currentPassword: string, newPassword: string) =>
  request("/api/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });

export const sendVerificationCode = (email: string) =>
  request("/api/send-verification-code", { method: "POST", body: JSON.stringify({ email }) });

export const verifyCodeAndResetPassword = (email: string, code: string, newPassword: string) =>
  request("/api/verify-code-and-reset-password", { method: "POST", body: JSON.stringify({ email, code, newPassword }) });

export const sendSMS = (phoneNumber: string) =>
  request("/api/send-sms", { method: "POST", body: JSON.stringify({ phoneNumber }) });

// 토큰 관리 (임시)
let authToken: string | null = null;

export const setToken = (token: string) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

export const getToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
};

export const clearToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};