export type AlertMode = 'silent' | 'vibrate' | 'melody';

// localStorage 키
const ALERT_MODE_KEY = 'lostFinder_alertMode';

// 기본 알림 모드
const DEFAULT_ALERT_MODE: AlertMode = 'melody';

// 알림 모드 가져오기
export const getAlertMode = (): AlertMode => {
  try {
    const savedMode = localStorage.getItem(ALERT_MODE_KEY);
    return (savedMode as AlertMode) || DEFAULT_ALERT_MODE;
  } catch (error) {
    console.error('알림 모드 로드 실패:', error);
    return DEFAULT_ALERT_MODE;
  }
};

// 알림 모드 저장하기
export const setAlertMode = (mode: AlertMode): void => {
  try {
    localStorage.setItem(ALERT_MODE_KEY, mode);
  } catch (error) {
    console.error('알림 모드 저장 실패:', error);
  }
};

// 알림 실행하기
export const triggerAlert = (mode: AlertMode = getAlertMode()): void => {
  try {
    switch (mode) {
      case 'silent':
        // 무음 모드: 아무것도 하지 않음
        break;
        
      case 'vibrate':
        // 진동 모드: 300ms 진동
        if ('vibrate' in navigator) {
          navigator.vibrate([300]);
        }
        break;
        
      case 'melody':
        // 멜로디 모드: 사운드 재생
        const audio = new Audio('/sound/ding.mp3');
        audio.volume = 0.5; // 볼륨 50%로 설정
        audio.play().catch(error => {
          console.error('사운드 재생 실패:', error);
          // 사운드 재생 실패 시 진동으로 대체
          if ('vibrate' in navigator) {
            navigator.vibrate([300]);
          }
        });
        break;
        
      default:
        console.warn('알 수 없는 알림 모드:', mode);
        break;
    }
  } catch (error) {
    console.error('알림 실행 실패:', error);
  }
};

// 알림 모드 변경하기
export const changeAlertMode = (newMode: AlertMode): void => {
  setAlertMode(newMode);
  // 설정 변경 시 즉시 테스트 알림 실행
  triggerAlert(newMode);
}; 