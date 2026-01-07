# LostFinder - 분실물 찾기 서비스

분실물을 등록하고 찾을 수 있는 웹 애플리케이션입니다. **플레이스토어 등록 준비 완료** 🚀

## 주요 기능

- ✅ **Google OAuth 로그인** (간편 로그인)
- ✅ 회원가입/로그인
- ✅ 분실물 등록 및 관리
- ✅ 다중 이미지 업로드
- ✅ 댓글 시스템
- ✅ **실제 SMS 인증을 통한 비밀번호 재설정**
- ✅ **임시 비밀번호 시스템**
- ✅ **보안 강화 (API 키 서버 보관)**
- ✅ **카카오맵 통합 (분실 위치 표시)**
- 🌍 **다국어 지원 (한국어/영어/일본어)**
- 🎨 **카드형 그리드 레이아웃 (Pinterest 스타일)**
- ♾️ **무한 스크롤 기능**
- 🔒 **위치 모호화 (GDPR 준수)**
- 💰 **아마존 어소시에이트 수익화**
- 🔍 **SEO 최적화**

## 설치 및 실행

### 0. Google OAuth 설정 (필수)
Google 로그인을 사용하려면 먼저 OAuth Client ID를 발급받아야 합니다.
자세한 설정 방법은 [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) 파일을 참고하세요.

#### 간단 설정:
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. OAuth 2.0 Client ID 생성 (웹 애플리케이션)
4. Client ID 복사

#### 환경 변수 설정:
```bash
# client/.env 파일 생성
echo "REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com" > client/.env

# server/.env 파일 생성
echo "GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com" > server/.env
echo "PORT=5000" >> server/.env
```

### 1. 백엔드 서버 실행
```bash
cd server
npm install
npm start
```

### 2. 프론트엔드 실행
```bash
cd client
npm install
npm start
```

## 카카오맵 API 설정

### 1. 카카오 개발자 계정 생성
1. [카카오 개발자 사이트](https://developers.kakao.com/) 방문
2. 카카오 계정으로 로그인
3. 애플리케이션 생성

### 2. 애플리케이션 설정
1. **플랫폼** 탭에서 **Web 플랫폼** 등록
2. **도메인** 설정에 다음 추가:
   - `http://localhost:3000`
   - `https://localhost:3000` (HTTPS 사용 시)
   - `http://127.0.0.1:3000`

### 3. API 키 설정
1. **앱 키** 탭에서 **JavaScript 키** 복사
2. 프로젝트 루트에 `.env` 파일 생성:
```env
REACT_APP_KAKAO_MAP_API_KEY=your_javascript_key_here
```

### 4. API 키 확인
- [카카오 개발자 콘솔](https://developers.kakao.com/console/app)에서 JavaScript 키 확인
- 도메인 설정이 올바른지 확인

## SMS 인증 설정 (플레이스토어 등록용)

### 1. Twilio 계정 생성
1. [Twilio 가입](https://www.twilio.com/try-twilio) (무료)
2. 무료 크레딧 받기 (약 $15-20)
3. 전화번호 발급받기

### 2. 서버 환경변수 설정
`server` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
PORT=5000
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
```

### 3. 프론트엔드 환경변수 설정
프로젝트 루트에 `.env` 파일을 생성:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

### 4. API 키 확인 방법
- [Twilio Console](https://console.twilio.com/)에서 Account SID와 Auth Token 확인
- [Phone Numbers](https://console.twilio.com/phone-numbers)에서 발신 번호 확인
- [카카오 개발자 콘솔](https://developers.kakao.com/console/app)에서 JavaScript 키 확인

## 플레이스토어 등록 준비 완료 ✅

### 보안 기능
- ✅ API 키 서버 보관 (브라우저 노출 없음)
- ✅ 백엔드 API 검증
- ✅ CORS 설정
- ✅ 에러 처리

### 사용자 경험
- ✅ 실제 SMS 발송
- ✅ 임시 비밀번호 후 강제 변경
- ✅ 서버 상태 실시간 확인
- ✅ 개발/프로덕션 모드 자동 전환
- ✅ 카카오맵 통합 (분실 위치 시각화)

### 비용 정보
- **무료 크레딧**: 1,000-1,500건 SMS 발송 가능
- **추가 비용**: $0.0079/건 (약 10원)
- **카카오맵**: 무료 (일일 사용량 제한 있음)

## 개발 모드
환경변수가 설정되지 않은 경우, 서버에서 SMS 발송을 시뮬레이션합니다.

## 기술 스택

### 프론트엔드
- React
- TypeScript
- React Router
- LocalStorage
- 카카오맵 API
- **react-i18next** (다국어 지원)
- **date-fns** (날짜 포맷팅)
- **react-helmet-async** (SEO 최적화)

### 백엔드
- Node.js
- Express.js
- Twilio SMS API
- CORS

## 배포 준비

### Heroku 배포
```bash
# 서버 배포
cd server
heroku create your-app-name
heroku config:set TWILIO_ACCOUNT_SID=your_sid
heroku config:set TWILIO_AUTH_TOKEN=your_token
heroku config:set TWILIO_FROM_NUMBER=your_number
git push heroku main

# 프론트엔드 배포
REACT_APP_API_URL=https://your-app-name.herokuapp.com
REACT_APP_KAKAO_MAP_API_KEY=your_kakao_map_api_key
npm run build
```

### 플레이스토어 등록
- ✅ 실제 SMS 인증 완료
- ✅ 보안 검증 완료
- ✅ 사용자 인증 시스템 완료
- ✅ 카카오맵 통합 완료
- 🚀 **플레이스토어 등록 준비 완료!**

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
