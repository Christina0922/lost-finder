# LostFinder - 분실물 찾기 서비스

분실물을 등록하고 찾을 수 있는 웹 애플리케이션입니다. **플레이스토어 등록 준비 완료** 🚀

## 주요 기능

- ✅ 회원가입/로그인
- ✅ 분실물 등록 및 관리
- ✅ 다중 이미지 업로드
- ✅ 댓글 시스템
- ✅ **실제 SMS 인증을 통한 비밀번호 재설정**
- ✅ **임시 비밀번호 시스템**
- ✅ **보안 강화 (API 키 서버 보관)**

## 설치 및 실행

### 1. 백엔드 서버 실행
```bash
cd server
npm install
npm start
```

### 2. 프론트엔드 실행
```bash
npm install
npm start
```

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
```

### 4. API 키 확인 방법
- [Twilio Console](https://console.twilio.com/)에서 Account SID와 Auth Token 확인
- [Phone Numbers](https://console.twilio.com/phone-numbers)에서 발신 번호 확인

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

### 비용 정보
- **무료 크레딧**: 1,000-1,500건 SMS 발송 가능
- **추가 비용**: $0.0079/건 (약 10원)

## 개발 모드
환경변수가 설정되지 않은 경우, 서버에서 SMS 발송을 시뮬레이션합니다.

## 기술 스택

### 프론트엔드
- React
- TypeScript
- React Router
- LocalStorage

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
npm run build
```

### 플레이스토어 등록
- ✅ 실제 SMS 인증 완료
- ✅ 보안 검증 완료
- ✅ 사용자 인증 시스템 완료
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

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
