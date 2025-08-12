// C:\LostFinderProject\client\src\utils\api.ts
// 프록시 사용: 절대경로 금지. 항상 '/api/...' 상대경로.

export type ApiLoginResult = {
  success: boolean;
  user?: { email: string; username?: string };
  token?: string;
  error?: string;
};

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options
  });

  // 프록시 실패 시 dev 서버가 텍스트("Proxy error: ...")를 보냄 → JSON 파싱 전 텍스트 확인
  const ct = res.headers.get('content-type') || '';
  const text = ct.includes('application/json') ? null : await res.text().catch(() => null);
  if (!res.ok) {
    if (text) throw new Error(text); // Proxy error 등
    try {
      const data = await res.json();
      throw new Error((data && (data.message || data.error)) || `요청 실패 (${res.status})`);
    } catch {
      throw new Error(`요청 실패 (${res.status})`);
    }
  }
  return (ct.includes('application/json') ? await res.json() : (text as unknown as T));
}

// LoginPage.tsx에서 사용하는 시그니처와 동일
export async function login(email: string, password: string): Promise<ApiLoginResult> {
  const body = { email, password, id: email, pw: password }; // 서버가 어떤 키를 기대해도 통과
  const data = await request<ApiLoginResult>('/api/login', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  // 서버가 success/ok 중 무엇을 쓰든 일관되게 반환
  if ((data as any).ok !== undefined) {
    const d: any = data;
    return { success: !!d.ok, user: d.user, token: d.token, error: d.error || d.message };
  }
  return data;
}

// 누락된 API 함수들 추가
export const getLostItemById = async (id: string) => {
  const response = await request(`/api/lost-items/${id}`);
  return response;
};

export const addComment = async (itemId: string, comment: any) => {
  const response = await request('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ itemId, comment }),
  });
  return response;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await request('/api/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return response;
};

export const checkServerHealth = async () => {
  const response = await request('/api/health');
  return response;
};

export const sendSMS = async (phone: string, message: string) => {
  const response = await request('/api/send-sms', {
    method: 'POST',
    body: JSON.stringify({ phone, message }),
  });
  return response;
};

export const sendVerificationCode = async (phone: string, code?: string) => {
  const response = await request('/api/send-verification', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
  return response;
};

export const getAllLostItems = async () => {
  const response = await request('/api/lost-items');
  return response;
};

export const addLostItem = async (item: any) => {
  const response = await request('/api/lost-items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return response;
};
