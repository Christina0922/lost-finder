# Google OAuth 설정 가이드

## 1. Google Cloud Console 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: "LostFinder" (원하는 이름 입력)

## 2. OAuth 2.0 Client ID 생성

### 2.1 OAuth 동의 화면 구성
1. 좌측 메뉴 → **API 및 서비스** → **OAuth 동의 화면**
2. 사용자 유형 선택: **외부** 선택 → **만들기**
3. 앱 정보 입력:
   - 앱 이름: `LostFinder`
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 정보: 본인 이메일
4. **저장 후 계속** 클릭
5. 범위 단계: **저장 후 계속** (기본값 유지)
6. 테스트 사용자 단계: **저장 후 계속** (선택사항)
7. 요약 확인 후 **대시보드로 돌아가기**

### 2.2 사용자 인증 정보 생성
1. 좌측 메뉴 → **API 및 서비스** → **사용자 인증 정보**
2. **사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름: `LostFinder Web Client`
5. **승인된 JavaScript 원본** 추가:
   ```
   http://localhost:3000
   http://localhost:5000
   https://your-production-domain.com
   ```
6. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000
   http://localhost:5000
   https://your-production-domain.com
   ```
7. **만들기** 클릭

## 3. Client ID 복사 및 설정

### 3.1 Client ID 복사
- 생성된 OAuth 클라이언트의 **클라이언트 ID** 복사
- 형식: `123456789-abcdefg.apps.googleusercontent.com`

### 3.2 환경 변수 설정

#### 클라이언트 (.env 파일)
```bash
# client/.env 파일 생성
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

#### 서버 (.env 파일)
```bash
# server/.env 파일 생성
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
PORT=5000
```

## 4. Android 앱용 추가 설정 (선택사항)

### 4.1 SHA-1 인증서 지문 생성
```bash
# 디버그 인증서
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# 릴리스 인증서 (실제 배포시)
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

### 4.2 Android OAuth Client 생성
1. Google Cloud Console → **사용자 인증 정보** → **사용자 인증 정보 만들기**
2. 애플리케이션 유형: **Android**
3. 패키지 이름: `com.lostfinder.app` (앱의 패키지명)
4. SHA-1 인증서 지문: 위에서 복사한 SHA-1 값
5. **만들기** 클릭

## 5. 테스트

### 5.1 개발 환경
```bash
# 서버 시작
cd server
npm install
npm start

# 클라이언트 시작 (새 터미널)
cd client
npm install
npm start
```

### 5.2 로그인 테스트
1. 브라우저에서 `http://localhost:3000` 접속
2. "Google로 시작하기" 버튼 클릭
3. Google 계정 선택
4. 로그인 성공 확인

## 6. 프로덕션 배포

### 6.1 도메인 등록
1. Google Cloud Console → OAuth 클라이언트 편집
2. **승인된 JavaScript 원본**에 프로덕션 도메인 추가:
   ```
   https://your-domain.com
   ```
3. **승인된 리디렉션 URI**에 프로덕션 도메인 추가:
   ```
   https://your-domain.com
   https://your-domain.com/callback
   ```

### 6.2 환경 변수 설정
- 프로덕션 서버의 `.env` 파일에 Client ID 설정
- Vercel, Netlify 등의 환경 변수 설정에 추가

## 7. 문제 해결

### "승인되지 않은 원본" 오류
- Google Cloud Console에서 현재 도메인이 승인된 JavaScript 원본에 추가되어 있는지 확인
- 변경사항이 적용되려면 최대 5분 소요

### "리디렉션 URI 불일치" 오류
- OAuth 클라이언트 설정에서 리디렉션 URI 확인
- 정확히 일치해야 함 (후행 슬래시 주의)

### One Tap이 표시되지 않음
- 브라우저 쿠키 설정 확인
- 시크릿 모드에서는 작동하지 않을 수 있음
- HTTPS 필요 (프로덕션 환경)

## 8. 보안 고려사항

1. **Client ID 보호**: `.env` 파일은 `.gitignore`에 추가
2. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 사용
3. **토큰 검증**: 서버에서 Google 토큰을 반드시 검증
4. **사용자 데이터**: 필요한 최소한의 정보만 요청

## 참고 자료
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web)
- [React OAuth Google 라이브러리](https://www.npmjs.com/package/@react-oauth/google)

