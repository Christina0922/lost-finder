# 🔐 보안 가이드

## API 키 관리

### ✅ 안전한 방법
- API 키는 **서버의 `.env` 파일**에만 저장
- `.env` 파일은 `.gitignore`에 포함되어 GitHub에 업로드되지 않음
- 클라이언트는 서버 API를 통해 간접적으로 사용

### ❌ 위험한 방법
- API 키를 코드에 직접 입력
- API 키를 GitHub에 업로드
- API 키를 클라이언트에서 직접 사용

## 환경변수 설정

### 서버 (필수)
`server/.env` 파일 생성:
```env
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 클라이언트 (선택사항)
`client/.env` 파일 생성:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

## 배포 시 환경변수 설정

### Vercel
1. 프로젝트 설정 → Environment Variables
2. `GOOGLE_MAPS_API_KEY` 추가
3. Production/Preview/Development 환경 선택

### Heroku
```bash
heroku config:set GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Railway
1. 프로젝트 → Variables 탭
2. `GOOGLE_MAPS_API_KEY` 추가

## Google Maps API 키 제한 설정

### API 제한
- ✅ Geocoding API만 활성화
- ❌ 다른 API는 비활성화

### 서버 제한 (추천)
- IP 주소 제한 사용
- 배포 서버의 IP 주소만 허용

### HTTP 리퍼러 제한 (대안)
```
https://yourdomain.com/*
https://your-app.vercel.app/*
```

## 민감한 파일 목록

다음 파일들은 절대 GitHub에 업로드하지 마세요:
- `.env`
- `.env.local`
- `*.key`
- `*.secret`
- `*API*.txt`
- `secrets/`

## 이미 GitHub에 API 키를 올렸다면?

### 즉시 조치사항:
1. **Google Cloud Console에서 해당 API 키 삭제**
2. **새 API 키 발급**
3. **Git 히스토리에서 API 키 제거**:

```bash
# BFG Repo-Cleaner 사용 (추천)
# https://rtyley.github.io/bfg-repo-cleaner/

# 또는 git-filter-repo 사용
pip install git-filter-repo
git filter-repo --invert-paths --path server/.env
git filter-repo --invert-paths --path client/.env
```

4. **강제 푸시**:
```bash
git push origin main --force
```

## 보안 체크리스트

- [ ] `.gitignore`에 `.env` 포함
- [ ] 서버 `.env`에만 API 키 저장
- [ ] Google Maps API 키에 제한 설정
- [ ] 배포 환경에 환경변수 설정
- [ ] 민감한 파일이 Git에 추적되지 않는지 확인
- [ ] 예제 파일(`.env.example`)만 GitHub에 업로드

## 참고 링크

- [Google Maps API 키 보안 모범 사례](https://developers.google.com/maps/api-security-best-practices)
- [환경 변수 보안 가이드](https://12factor.net/config)
- [Git에서 민감한 정보 제거](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

