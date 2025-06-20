// 백엔드 API를 통한 SMS 발송 유틸리티
// API 키는 서버에만 저장되어 보안이 보장됩니다.

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: to, message })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ SMS 발송 성공: ${to}`);
      return true;
    } else {
      console.error(`❌ SMS 발송 실패: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('❌ SMS API 호출 실패:', error);
    return false;
  }
};

export const sendVerificationCode = async (phone: string, code: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, code })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ 인증번호 발송 요청 성공: ${phone}`);
      return true;
    } else {
      console.error(`❌ 인증번호 발송 실패: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('❌ 인증번호 API 호출 실패:', error);
    return false;
  }
};

// 서버 상태 확인
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.status === 'OK';
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

// 설정 가이드
export const getSetupGuide = () => {
  return `
🔧 플레이스토어 등록용 완전한 SMS 시스템 설정 가이드:

## 1. 백엔드 서버 설정
1. server 폴더로 이동: cd server
2. 환경변수 설정 (.env 파일 생성):
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_FROM_NUMBER=+1234567890
3. 서버 실행: npm start

## 2. 프론트엔드 설정
1. .env 파일 생성:
   REACT_APP_API_URL=http://localhost:5000
2. React 앱 실행: npm start

## 3. Twilio 설정
1. Twilio 가입: https://www.twilio.com/try-twilio
2. 무료 크레딧 받기 ($15-20)
3. 전화번호 발급받기
4. API 키 확인

## 4. 플레이스토어 등록 준비
- ✅ 실제 SMS 발송
- ✅ 보안 강화 (API 키 서버 보관)
- ✅ 사용자 인증 완료
- ✅ 임시 비밀번호 시스템

💰 비용: 무료 크레딧으로 1,000-1,500건 SMS 발송 가능
  `;
}; 