# Google Maps API 키 설정 가이드

## ✅ 이 프로젝트는 CRA (Create React App)입니다

## 1. API 키 설정 위치

```
D:\1000_b_project\lostfinder\client\.env
```

## 2. .env 파일 생성

### Windows에서:
```cmd
cd D:\1000_b_project\lostfinder\client
notepad .env
```

### 또는 탐색기에서:
1. `D:\1000_b_project\lostfinder\client` 폴더 열기
2. 빈 텍스트 파일 만들기
3. 파일명을 `.env`로 변경 (확장자 없음)

## 3. .env 파일 내용

```env
# Google Maps API 키 (CRA 프로젝트용)
REACT_APP_GOOGLE_MAPS_API_KEY=여기에_발급받은_API_키_붙여넣기
```

### 예시:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstu
```

## 4. 어떤 키를 넣어야 하나요?

Google Cloud Console에서 발급받은 키 중:
- ✅ **웹용 키** (HTTP referrer 제한)
- ❌ Android/iOS 전용 키는 사용 안 함

## 5. API 키 제한 설정 (필수!)

Google Cloud Console → API 키 설정:

### HTTP 리퍼러 (웹사이트):
```
http://localhost:3000/*
http://localhost:5000/*
https://yourdomain.com/*
```

### API 제한:
- ✅ Geocoding API만 선택

## 6. 저장 후 재시작

⚠️ **매우 중요**: .env 파일 수정 후 **반드시 재시작**

```cmd
# 1. 실행 중인 서버 종료
taskkill /F /IM node.exe

# 2. 클라이언트 재시작
cd client
npm start
```

## 7. 작동 확인

### 브라우저 개발자 도구 (F12) → Console 탭:

✅ **성공 시:**
```
🔍 [Geocoding] 주소 검색 시작: "서울역"
✅ [Geocoding] 성공: lat=37.5547125, lng=126.9707878
```

❌ **API 키 없을 때:**
```
❌ REACT_APP_GOOGLE_MAPS_API_KEY가 설정되지 않았습니다
```

❌ **API 키 잘못되었을 때:**
```
❌ [Geocoding] API 키 오류: REQUEST_DENIED
```

## 8. 문제 해결

### "API 키가 설정되지 않았습니다"
1. `.env` 파일 위치 확인: `client` 폴더 안에 있어야 함
2. 파일명 확인: `.env` (확장자 없음, `.env.txt` 아님)
3. 변수명 확인: `REACT_APP_GOOGLE_MAPS_API_KEY` (대소문자 정확히)
4. 재시작 확인: npm start 다시 실행

### "REQUEST_DENIED" 오류
1. Google Cloud Console에서 Geocoding API 활성화
2. HTTP 리퍼러에 `http://localhost:3000/*` 추가
3. API 키 제한에서 Geocoding API 선택

### "ZERO_RESULTS" 오류
→ 정상입니다. 주소가 잘못되었거나 구체적이지 않음

## 9. 보안 주의사항

✅ **이미 처리됨**: `.gitignore`에 `.env` 포함되어 있음 (확인 완료)

❌ **절대 하지 말 것**:
- GitHub에 API 키 업로드
- 코드에 API 키 하드코딩
- 제한 없는 API 키 사용

## 10. 테스트 시나리오

### 테스트 1: 서울역
1. 분실물 등록
2. 주소: "서울역"
3. 저장 후 상세 페이지
4. 지도가 서울역으로 표시되는지 확인

### 테스트 2: 부산역
1. 분실물 등록
2. 주소: "부산역"
3. 저장 후 상세 페이지
4. 지도가 부산역으로 표시되는지 확인

### 테스트 3: 제주공항
1. 분실물 등록
2. 주소: "제주국제공항"
3. 저장 후 상세 페이지
4. 지도가 제주공항으로 표시되는지 확인

### 테스트 4: 잘못된 주소
1. 분실물 등록
2. 주소: "asdfasdfasdf"
3. 저장 후 상세 페이지
4. "주소를 찾을 수 없습니다" 메시지 확인

## 11. 비용 정보

- **무료 할당량**: 월 $200 크레딧
- **Geocoding API**: 요청당 $0.005
- **예상 비용**: 
  - 100회 조회/일 = 월 $15
  - 1,000회 조회/일 = 월 $150

---

**준비 완료!** API 키만 넣으면 바로 작동합니다. 🎉

