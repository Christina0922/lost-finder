import type { LostItem, Comment } from '../types';

// 환경변수에 따라 API URL 설정
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const API_BASE_URL = '/api'; // 무조건 프록시 경로 사용

// 핸드폰번호 정규화 함수
export const normalizePhoneNumber = (phone: string): string => {
  // 모든 공백, 하이픈, 괄호 제거
  let normalized = phone.replace(/[\s\-()]/g, '');

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

// 공통 에러 처리 함수
const handleApiError = (error: any, context: string) => {
  console.error(`${context} API 오류:`, error);
  
  let message = '서버와의 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.';
  
  if (error.response?.status === 404) {
    message = '요청하신 정보를 찾을 수 없습니다.';
  } else if (error.response?.status === 500) {
    message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    message = '네트워크 연결을 확인해 주세요.';
  } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    message = '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
  }
  
  // 사용자에게 알림
  alert(message);
  
  return { success: false, error: message };
};

// API 호출 래퍼 함수
const safeApiCall = async (apiFunction: () => Promise<any>, context: string) => {
  try {
    return await apiFunction();
  } catch (error) {
    return handleApiError(error, context);
  }
};

export const login = async (email: string, password: string) => {
  return safeApiCall(async () => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '로그인에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '로그인');
};

export const register = async (email: string, password: string, name: string) => {
  return safeApiCall(async () => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '회원가입에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '회원가입');
};

export const requestPasswordResetByEmail = async (email: string) => {
  return safeApiCall(async () => {
    const response = await fetch('/api/request-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '비밀번호 재설정 이메일 발송에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '이메일 비밀번호 재설정');
};

export const requestPasswordResetBySMS = async (phone: string) => {
  return safeApiCall(async () => {
    const response = await fetch('/api/request-password-reset-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'SMS 발송에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, 'SMS 비밀번호 재설정');
};

export const resetPassword = async (token: string, newPassword: string) => {
  return safeApiCall(async () => {
    const response = await fetch('/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '비밀번호 재설정에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '비밀번호 재설정');
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  return safeApiCall(async () => {
    const response = await fetch('/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '비밀번호 변경');
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
    
    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('서버 응답이 JSON이 아닙니다:', text);
      throw new Error('서버에서 잘못된 응답을 받았습니다.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('서버 연결에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('서버 상태 확인 오류:', error);
    if (error instanceof SyntaxError) {
      throw new Error('서버 연결에 문제가 있습니다. 서버가 실행 중인지 확인해주세요.');
    }
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

/**
 * 등록 응답에서 ID를 안전하게 추출
 * 서버 구현에 따라 키가 다를 수 있어서 다양한 경우를 지원
 */
export const extractCreatedId = (data: any): string | number | null => {
  const id =
    data?.item?.id ??
    data?.id ??
    data?._id ??
    data?.itemId ??
    data?.createdId ??
    data?.result?.id ??
    data?.result?._id ??
    data?.data?.id ??
    data?.data?._id;

  if (id === 0) return 0;
  if (id === undefined || id === null) return null;
  return id;
};

// 분실물 관련 API
export const getAllLostItems = async (): Promise<LostItem[]> => {
  return safeApiCall(async () => {
    const response = await fetch('/api/lost-items');
    
    if (!response.ok) {
      throw new Error('분실물 목록을 불러올 수 없습니다.');
    }
    
    const data = await response.json();
    return (data.items || []) as LostItem[];
  }, '분실물 목록 조회');
};

export const getLostItemById = async (id: number): Promise<LostItem> => {
  return safeApiCall(async () => {
    const response = await fetch(`/api/lost-items/${id}`);
    
    if (!response.ok) {
      throw new Error('분실물 정보를 불러올 수 없습니다.');
    }
    
    const data = await response.json();
    return data.item as LostItem;
  }, '분실물 상세 조회');
};

export const createLostItem = async (item: Omit<LostItem, 'id' | 'comments' | 'author_id'>) => {
  return safeApiCall(async () => {
    const response = await fetch('/api/lost-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '분실물 등록에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '분실물 등록');
};

export const updateLostItem = async (id: number, item: Partial<LostItem>) => {
  return safeApiCall(async () => {
    const response = await fetch(`/api/lost-items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '분실물 수정에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '분실물 수정');
};

export const deleteLostItem = async (id: number) => {
  return safeApiCall(async () => {
    const response = await fetch(`/api/lost-items/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '분실물 삭제에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '분실물 삭제');
};

// 댓글 관련 API
export const createComment = async (itemId: number, text: string) => {
  return safeApiCall(async () => {
    const response = await fetch(`/api/lost-items/${itemId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '댓글 등록에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '댓글 등록');
};

export const deleteComment = async (commentId: number) => {
  return safeApiCall(async () => {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '댓글 삭제에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, '댓글 삭제');
};

export const getCommentsByItemId = async (itemId: number) => {
  return safeApiCall(async () => {
    const response = await fetch(`/api/lost-items/${itemId}/comments`);
    
    if (!response.ok) {
      throw new Error('댓글 목록을 불러올 수 없습니다.');
    }
    
    const data = await response.json();
    return data;
  }, '댓글 목록 조회');
};

// Google OAuth 로그인
export const googleLogin = async (credential: string) => {
  return safeApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google 로그인에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }, 'Google 로그인');
};

// ==================== Google Places API ====================

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeName: string;
  address: string;
  lat: number;
  lng: number;
}

export interface GeocodedLocation {
  address: string;
  lat: number;
  lng: number;
}

/**
 * Places Autocomplete (장소 검색 자동완성)
 * @param input 검색어
 * @returns 최대 6개의 자동완성 결과
 */
export const searchPlaces = async (input: string): Promise<PlacePrediction[]> => {
  return safeApiCall(async () => {
    if (!input || input.trim().length === 0) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/places/autocomplete?input=${encodeURIComponent(input)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '장소 검색에 실패했습니다.');
    }

    const data = await response.json();
    return data.predictions || [];
  }, '장소 검색');
};

/**
 * 장소 상세 정보 (선택한 장소의 상세 정보)
 * @param placeId 장소 ID
 * @returns 장소명, 주소, 좌표
 */
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  return safeApiCall(async () => {
    const response = await fetch(
      `${API_BASE_URL}/places/details?placeId=${placeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '장소 정보 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data.place;
  }, '장소 정보 조회');
};

/**
 * Geocoding (주소 → 좌표 변환)
 * @param address 주소
 * @returns 정확한 주소와 좌표
 */
export const geocodeAddress = async (address: string): Promise<GeocodedLocation> => {
  return safeApiCall(async () => {
    const response = await fetch(
      `${API_BASE_URL}/places/geocode?address=${encodeURIComponent(address)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '주소 변환에 실패했습니다.');
    }

    const data = await response.json();
    return data.location;
  }, '주소 변환');
}; 