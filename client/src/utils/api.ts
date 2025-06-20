const API_BASE_URL = process.env.REACT_APP_API_URL || '';

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