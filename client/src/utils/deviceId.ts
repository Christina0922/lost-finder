import { v4 as uuidv4 } from 'uuid';

/**
 * 디바이스 ID를 관리하는 유틸리티
 * 로그인 없이 사용자를 구분하기 위해 사용
 */

const DEVICE_ID_KEY = 'lostfinder_device_id';

/**
 * 디바이스 ID 가져오기 (없으면 생성)
 */
export const getDeviceId = (): string => {
  try {
    // localStorage에서 기존 ID 확인
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // 없으면 새로 생성
      const newDeviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, newDeviceId);
      console.log('✅ 새로운 Device ID 생성:', newDeviceId);
      return newDeviceId;
    }
    
    return deviceId;
  } catch (error) {
    console.error('❌ Device ID 가져오기 실패:', error);
    // localStorage 사용 불가시 세션용 임시 ID 생성
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

/**
 * 디바이스 ID 초기화 (테스트용)
 */
export const resetDeviceId = (): string => {
  try {
    const newDeviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, newDeviceId);
    console.log('🔄 Device ID 재설정:', newDeviceId);
    return newDeviceId;
  } catch (error) {
    console.error('❌ Device ID 재설정 실패:', error);
    return getDeviceId();
  }
};

/**
 * 현재 디바이스가 작성한 글인지 확인
 */
export const isMyItem = (itemDeviceId: string | null | undefined): boolean => {
  if (!itemDeviceId) return false;
  const currentDeviceId = getDeviceId();
  return itemDeviceId === currentDeviceId;
};

/**
 * Device ID 통계 (디버깅용)
 */
export const getDeviceIdInfo = () => {
  const deviceId = getDeviceId();
  const createdAt = localStorage.getItem(`${DEVICE_ID_KEY}_created`);
  
  return {
    deviceId,
    createdAt: createdAt || 'Unknown',
    length: deviceId.length,
    isTemp: deviceId.startsWith('temp-')
  };
};

// 앱 시작 시 디바이스 ID 초기화
export const initializeDeviceId = () => {
  const deviceId = getDeviceId();
  
  // 생성 시간이 없으면 현재 시간 저장
  const createdKey = `${DEVICE_ID_KEY}_created`;
  if (!localStorage.getItem(createdKey)) {
    try {
      localStorage.setItem(createdKey, new Date().toISOString());
    } catch (error) {
      console.warn('Device ID 생성 시간 저장 실패');
    }
  }
  
  console.log('📱 Device ID 초기화 완료:', deviceId);
  return deviceId;
};

