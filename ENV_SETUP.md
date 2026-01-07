# 환경변수 설정 가이드

## 1. Google Cloud Console 설정

### API 활성화
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 선택
3. "API 및 서비스" → "라이브러리"에서 다음 API 활성화:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

### API 키 생성
1. "API 및 서비스" → "사용자 인증 정보"
2. "+ 사용자 인증 정보 만들기" → "API 키"
3. 생성된 API 키 복사

### API 키 제한 설정 (권장)
**HTTP referrer 제한:**
- `http://localhost:3000/*`
- `https://yourdomain.com/*`

**API 제한:**
- Maps JavaScript API
- Places API
- Geocoding API

## 2. 클라이언트 환경변수 설정

`client/.env` 파일 생성:

```env
# Google Maps API 키
REACT_APP_GOOGLE_MAPS_API_KEY=여기에_구글맵_API_키_입력

# Google OAuth 클라이언트 ID (이미 설정된 경우)
REACT_APP_GOOGLE_CLIENT_ID=여기에_구글_OAuth_클라이언트_ID_입력

# API 기본 URL
REACT_APP_API_BASE_URL=http://localhost:5000
```

## 3. 서버 환경변수 설정

`server/.env` 파일 생성:

```env
# Google Maps API 키 (서버용 - Places API 프록시)
GOOGLE_MAPS_API_KEY=여기에_구글맵_API_키_입력

# Google OAuth 클라이언트 ID (이미 설정된 경우)
GOOGLE_CLIENT_ID=여기에_구글_OAuth_클라이언트_ID_입력

# 서버 포트
PORT=5000

# 데이터베이스 경로
DB_PATH=./users.db

# CoolSMS API (선택사항)
COOLSMS_API_KEY=여기에_CoolSMS_API_키_입력
COOLSMS_API_SECRET=여기에_CoolSMS_API_시크릿_입력

# 이메일 설정 (선택사항)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## 4. 배포 환경 (Vercel/Railway)

### Vercel (클라이언트)
Settings → Environment Variables에서:
- `REACT_APP_GOOGLE_MAPS_API_KEY`
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_API_BASE_URL` (배포된 서버 URL)

### Railway (서버)
Variables에서:
- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_CLIENT_ID`
- `PORT`
- 기타 필요한 환경변수

## 5. 보안 주의사항

⚠️ **중요**: 
- `.env` 파일은 절대 Git에 커밋하지 마세요
- API 키는 반드시 제한을 설정하세요
- 프론트엔드 환경변수는 브라우저에 노출되므로 민감한 정보를 넣지 마세요
- 서버 프록시를 통해 Places API를 호출하여 보안을 강화하세요

## 6. 테스트

환경변수가 제대로 설정되었는지 확인:

```bash
# 클라이언트
cd client
npm start

# 서버
cd server
npm start
```

개발 도구 콘솔에서 에러가 없는지 확인하세요.

