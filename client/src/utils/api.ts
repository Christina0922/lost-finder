// C:\LostFinderProject\client\src\utils\api.ts
export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (window as any).REACT_APP_API_BASE_URL ||
  (process.env as any).REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

// 공통 요청 유틸 (기본적으로 캐시 방지)
async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      credentials: "include",
      cache: "no-store",           // ✅ 캐시 사용 금지
      ...options,
    });
    
    // 응답이 없거나 JSON 파싱 실패 시 처리
    let data: any = {};
    try {
      const text = await res.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 빈 객체 사용
      console.warn('JSON 파싱 실패:', parseError);
    }
    
    if (!res.ok) {
      // 서버에서 반환한 에러 메시지 사용
      const errorMessage = (data as any)?.message || `요청 실패 (${res.status})`;
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      throw error;
    }
    return data as T;
  } catch (error: any) {
    // 네트워크 오류인지 확인
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      const networkError = new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      (networkError as any).isNetworkError = true;
      throw networkError;
    }
    // 기타 오류는 그대로 전달
    console.warn('API 요청 실패:', path, error);
    throw error;
  }
}

/** 분실물 전체 목록 */
export async function getAllLostItems() {
  try {
    // ✅ 캐시 무력화 & 최신 목록 보장(쿼리 스트링에 타임스탬프 추가)
    const ts = Date.now();
    
    // 타임아웃 설정 (10초) - 호환성 고려
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(`${API_BASE}/lost?ts=${ts}`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => []);
    if (!res.ok) {
      console.warn('목록 조회 실패:', data?.message || "목록 조회 실패");
      return []; // 에러 시 빈 배열 반환
    }
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    // 네트워크 오류, 타임아웃, 기타 오류 모두 조용히 처리
    if (error.name !== 'AbortError') {
      console.warn('분실물 목록 로드 실패 (서버 연결 불가):', error);
    }
    return []; // 항상 빈 배열 반환하여 앱이 깨지지 않도록
  }
}

/** 분실물 등록 */
export async function createLostItem(payload: any) {
  try {
    const url = `${API_BASE}/lost`;
    
    // FormData인지 확인
    if (payload instanceof FormData) {
      const res = await fetch(url, {
        method: "POST",
        body: payload,
        credentials: "include",
        cache: "no-store",
      });
      
      // 네트워크 오류 확인
      if (!res.ok) {
        let errorMessage = "등록에 실패했습니다.";
        try {
          const data = await res.json();
          errorMessage = data?.message || `서버 오류 (${res.status})`;
        } catch (parseError) {
          errorMessage = `서버 오류 (${res.status})`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json().catch(() => ({}));
      return data;
    } else {
      // 기존 JSON 방식
      return request("/lost", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  } catch (error: any) {
    // 네트워크 오류 처리
    if (error.name === 'TypeError' && (error.message?.includes('fetch') || error.message?.includes('Failed to fetch'))) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    console.warn('분실물 등록 실패:', error);
    throw error; // 등록은 실패 시 에러를 throw해야 함
  }
}

/** 단건 조회 */
export async function getLostItemById(id: string | number): Promise<any> {
  try {
    return await request<any>(`/lost/${id}`, { method: "GET" });
  } catch (error) {
    console.warn('분실물 조회 실패:', id, error);
    throw error;
  }
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
  login: (email: string, password: string): Promise<any> =>
    request<any>("/api/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  requestReset: (email: string): Promise<any> =>
    request<any>("/auth/request-reset", { method: "POST", body: JSON.stringify({ email }) }),

  verifyResetToken: (email: string, token: string): Promise<any> =>
    request<any>("/api/forgot-password/verify", {
      method: "POST",
      body: JSON.stringify({ email, token })
    }),

  resetPassword: (email: string, token: string, newPassword: string): Promise<any> =>
    request<any>("/api/forgot-password/reset", {
      method: "POST",
      body: JSON.stringify({ email, token, newPassword })
    }),

  me: (): Promise<any> => request<any>("/api/me"),
};

export const checkServerHealth = () => request("/api/health");

// 기존 함수들도 유지 (호환성을 위해)
export const addLostItem = createLostItem;
export const updateLostItem = (id: string, item: any) => request(`/lost/${id}`, { method: "PUT", body: JSON.stringify(item) });

export const changePassword = (currentPassword: string, newPassword: string): Promise<any> =>
  request<any>("/api/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });

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