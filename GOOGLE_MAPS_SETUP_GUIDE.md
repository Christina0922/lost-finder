# Google Maps API 설정 가이드

## 1. API 키 발급

### 1단계: Google Cloud Console 접속
1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성 (또는 기존 프로젝트 선택)

### 2단계: Geocoding API 활성화
1. 좌측 메뉴에서 "API 및 서비스" → "라이브러리" 클릭
2. "Geocoding API" 검색
3. "사용 설정" 클릭

### 3단계: API 키 생성
1. 좌측 메뉴에서 "API 및 서비스" → "사용자 인증 정보" 클릭
2. "+ 사용자 인증 정보 만들기" → "API 키" 선택
3. 생성된 API 키 복사

### 4단계: API 키 제한 설정 (보안)
1. 생성된 API 키 옆의 편집 아이콘 클릭
2. "API 제한사항" 섹션에서:
   - "키 제한" 선택
   - "Geocoding API"만 선택
3. "애플리케이션 제한사항"에서:
   - "IP 주소"를 선택하고 서버 IP 입력 (선택사항)
4. 저장

## 2. 서버에 API 키 설정

### 방법 1: .env 파일 생성 (권장)

```bash
cd server
notepad .env
```

`.env` 파일에 다음 내용 추가:
```
GOOGLE_MAPS_API_KEY=발급받은_API_키_여기_붙여넣기
```

### 방법 2: 환경변수 직접 설정

Windows PowerShell:
```powershell
$env:GOOGLE_MAPS_API_KEY="발급받은_API_키"
cd server
npm start
```

## 3. 서버 재시작

```bash
# 기존 서버 종료
taskkill /F /IM node.exe

# 서버 폴더로 이동
cd server

# 서버 시작
npm start
```

## 4. 테스트

### 테스트 스크립트 실행
```bash
cd server
node test-google-geocoding.js
```

### 브라우저 테스트
1. http://localhost:3000 접속
2. 분실물 등록 페이지
3. 분실 장소에 "서울역" 입력
4. "주소 검색" 버튼 클릭
5. 장소명과 주소가 표시되는지 확인

## 5. 요금 정보

- **무료 할당량**: 월 $200 크레딧 (약 40,000회 무료 요청)
- **Geocoding API**: 요청당 $0.005
- **일일 사용량 제한**: 설정 가능
- **결제 정보**: 무료 한도 초과 시에만 청구

## 6. 문제 해결

### API 키 오류
```
❌ GOOGLE_MAPS_API_KEY 환경변수가 설정되지 않았습니다.
```
→ `.env` 파일 확인 또는 환경변수 재설정

### 인증 오류
```
❌ API 인증 실패
```
→ API 키가 올바른지, Geocoding API가 활성화되었는지 확인

### 할당량 초과
```
❌ OVER_QUERY_LIMIT
```
→ Google Cloud Console에서 일일 한도 확인 및 조정

## 7. 보안 권장사항

✅ **DO (권장)**
- `.env` 파일 사용
- `.gitignore`에 `.env` 추가
- API 키 제한 설정 (IP, API 종류)
- 정기적으로 키 갱신

❌ **DON'T (금지)**
- 코드에 API 키 하드코딩
- 공개 저장소에 API 키 업로드
- API 키를 클라이언트 코드에 노출

