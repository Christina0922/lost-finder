# 환경변수 설정 가이드

## 지도 API 키 설정 방법

### 1. `.env` 파일 생성
`client` 폴더에 `.env` 파일을 생성하고 아래 내용을 추가하세요:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=여기에_구글_지도_API_키_입력
REACT_APP_NAVER_MAPS_API_KEY=여기에_네이버_지도_Client_ID_입력
```

### 2. API 키 발급 방법

#### 구글 지도 API 키
1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성 또는 선택
3. "APIs & Services" > "Credentials" 메뉴로 이동
4. "Create Credentials" > "API Key" 선택
5. 발급받은 API 키를 복사하여 `.env` 파일에 입력

#### 네이버 지도 API 키 (Client ID)
1. https://www.ncloud.com/ 접속
2. "Application Service" > "Maps" 선택
3. 애플리케이션 등록
4. 발급받은 Client ID를 복사하여 `.env` 파일에 입력

### 3. 빌드 및 적용
환경변수를 설정한 후 반드시 다시 빌드해야 합니다:

```bash
cd client
npm run build
```

그 다음 assets 복사:
```bash
cd ..
node copy-assets.js
```

### 4. 주의사항
- `.env` 파일은 `client` 폴더 루트에 위치해야 합니다
- 환경변수 이름은 반드시 `REACT_APP_`로 시작해야 합니다
- 빌드 후에는 환경변수가 코드에 포함되므로, API 키를 변경하려면 다시 빌드해야 합니다
- `.env` 파일은 Git에 커밋하지 마세요 (보안상 위험)

