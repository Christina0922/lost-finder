const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 사용자 등록 API
export const registerUser = async (userData: {
  username: string;
  email: string;
  phone: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
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
    const response = await fetch(`${API_BASE_URL}/api/login`, {
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
    const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
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
    const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, newPassword }),
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
    const response = await fetch(`${API_BASE_URL}/api/send-sms`, {
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
    const response = await fetch(`${API_BASE_URL}/api/send-verification`, {
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

// 서버 상태 확인 API
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
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
    const response = await fetch(`${API_BASE_URL}/api/users`);
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