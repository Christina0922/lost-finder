const API_BASE_URL = '/api';

// 핸드폰번호 정규화 함수
export const normalizePhoneNumber = (phone: string): string => {
  // 모든 공백, 하이픈, 괄호 제거
  let normalized = phone.replace(/[\s\-\(\)]/g, '');

  // 010, 011 등으로 시작하는 경우 그대로 반환
  if (normalized.startsWith('0')) {
    return normalized;
  }

  // +82, 82로 시작하는 경우 0으로 변환
  if (normalized.startsWith('+82')) {
    return '0' + normalized.substring(3);
  }
  if (normalized.startsWith('82')) {
    return '0' + normalized.substring(2);
  }

  // 10자리 또는 11자리 숫자인 경우 그대로 반환
  if (normalized.length === 10 || normalized.length === 11) {
    return normalized;
  }

  return normalized;
};

// 핸드폰번호 유효성 검사 함수
export const validatePhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  // 010, 011, 016, 017, 018, 019로 시작하는 10~11자리 번호만 허용
  const koreanPhonePattern = /^01[016789][0-9]{7,8}$/;
  return koreanPhonePattern.test(normalized);
};

// 사용자 등록 API
export const registerUser = async (userData: {
  username: string;
  email: string;
  phone: string;
  password: string;
}) => {
  try {
    // 핸드폰번호 정규화
    const normalizedPhone = normalizePhoneNumber(userData.phone);
    
    // 핸드폰번호 유효성 검사
    if (!validatePhoneNumber(userData.phone)) {
      throw new Error('올바른 휴대폰 번호를 입력해주세요.');
    }
    
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...userData, phone: normalizedPhone }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '회원가입에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
};

// 로그인 API
export const loginUser = async (credentials: {
  username: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '로그인에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

// 비밀번호 찾기 - 전화번호 확인 API
export const forgotPassword = async (phone: string) => {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: normalizedPhone }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '비밀번호 찾기에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('비밀번호 찾기 오류:', error);
    throw error;
  }
};

// 비밀번호 재설정 API
export const resetPassword = async (phone: string, newPassword: string) => {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: normalizedPhone, newPassword }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '비밀번호 재설정에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    throw error;
  }
};

// SMS 발송 API
export const sendSMS = async (phone: string, message: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, message }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'SMS 발송에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('SMS 발송 오류:', error);
    throw error;
  }
};

// 인증번호 발송 API
export const sendVerificationCode = async (phone: string, code?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, code }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '인증번호 발송에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('인증번호 발송 오류:', error);
    throw error;
  }
};

// 인증번호 검증 API
export const verifyCode = async (phone: string, code: string) => {
  const response = await fetch(`${API_BASE_URL}/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '인증 실패');
  return data;
};

// 서버 상태 확인 API
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('서버 연결에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('서버 상태 확인 오류:', error);
    throw error;
  }
};

// 사용자 목록 조회 API (개발용)
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('사용자 목록 조회에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    throw error;
  }
}; 