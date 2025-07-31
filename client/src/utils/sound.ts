// 소리 재생 관리
let audio: HTMLAudioElement | null = null;
let isPlaying = false;

// 멜로디 재생
export function playMelody() {
  try {
    if (!audio) {
      // 간단한 비프음 생성 (실제 mp3 파일이 없어도 동작)
      audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      audio.loop = true;
      audio.volume = 0.3;
    }
    
    if (!isPlaying) {
      audio.currentTime = 0;
      audio.play().then(() => {
        isPlaying = true;
        console.log('🔊 멜로디 재생 시작');
      }).catch((error) => {
        console.log('🔇 멜로디 재생 실패 (사용자 상호작용 필요):', error);
        // 사용자 상호작용이 필요한 경우 진동으로 대체
        vibrate();
      });
    }
  } catch (error) {
    console.log('🔇 멜로디 재생 오류:', error);
    vibrate();
  }
}

// 멜로디 정지
export function stopMelody() {
  if (audio && isPlaying) {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    console.log('🔇 멜로디 정지');
  }
}

// 멜로디 무음 (볼륨 0)
export function muteMelody() {
  if (audio) {
    audio.volume = 0;
    console.log('🔇 멜로디 무음');
  }
}

// 진동 기능
export function vibrate() {
  try {
    if ('vibrate' in navigator) {
      // 진동 패턴: 200ms 진동, 100ms 대기, 200ms 진동, 100ms 대기, 200ms 진동
      navigator.vibrate([200, 100, 200, 100, 200]);
      console.log('📳 진동 실행');
    } else {
      console.log('📳 진동 기능을 지원하지 않는 기기입니다.');
    }
  } catch (error) {
    console.log('📳 진동 실행 오류:', error);
  }
}

// 알림 모드에 따른 동작 실행
export function executeAlertMode(mode: 'vibrate' | 'melody' | 'silent') {
  console.log(`🔔 알림 모드 실행: ${mode}`);
  
  switch (mode) {
    case 'vibrate':
      stopMelody();
      vibrate();
      break;
    case 'melody':
      playMelody();
      break;
    case 'silent':
      stopMelody();
      break;
    default:
      console.log('🔔 알 수 없는 알림 모드:', mode);
  }
}

// 알림 모드 변경 시 정리
export function cleanupAlertMode() {
  stopMelody();
} 