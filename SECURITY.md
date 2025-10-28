# LostFinder 보안 가이드

## 🔒 개인정보 보호 및 보안 설정

### 1. 환경변수 설정

#### 서버 환경변수 설정
```bash
# server/env.example 파일을 복사하여 .env 파일 생성
cp server/env.example server/.env

# .env 파일에서 다음 값들을 실제 값으로 변경:
- SMTP_USER: 실제 이메일 주소
- SMTP_PASS: 앱 비밀번호 (Gmail의 경우)
- JWT_SECRET: 강력한 시크릿 키
- SESSION_SECRET: 세션 암호화 키
```

#### 클라이언트 환경변수 설정
```bash
# 클라이언트 프로젝트 루트에 .env 파일 생성
# client/.env 파일에 다음 내용 추가:
REACT_APP_API_BASE_URL=http://172.30.1.44:5000
REACT_APP_KAKAO_MAP_API_KEY=e19a463823bdbefb87c2c66c3fb6ab59
REACT_APP_NODE_ENV=development
```

### 2. 보안 파일 보호

다음 파일들은 .gitignore에 의해 GitHub에 업로드되지 않습니다:
- `.env` 파일들
- `*.key`, `*.pem`, `*.p12`, `*.jks` 파일들
- `token.txt`
- `test-emails/` 디렉토리
- `**/private/`, `**/secrets/`, `**/keys/` 디렉토리들

### 3. API 키 보안

- 카카오맵 API 키는 환경변수로 관리
- 프로덕션 환경에서는 별도의 API 키 사용 권장
- API 키는 절대 코드에 직접 하드코딩하지 않음

### 4. 데이터베이스 보안

- SQLite 데이터베이스 파일은 로컬에만 저장
- 프로덕션 환경에서는 PostgreSQL 등 보안이 강화된 DB 사용 권장
- 사용자 비밀번호는 해시화하여 저장

### 5. 네트워크 보안

- 개발 환경: HTTP 사용 (로컬 네트워크)
- 프로덕션 환경: HTTPS 사용 필수
- CORS 설정으로 허용된 도메인만 접근 가능

## 🚀 배포 시 주의사항

1. **환경변수 설정**: 각 배포 환경에 맞는 .env 파일 설정
2. **API 키 교체**: 프로덕션용 API 키로 교체
3. **HTTPS 설정**: SSL 인증서 설정
4. **방화벽 설정**: 필요한 포트만 개방
5. **로그 모니터링**: 보안 관련 로그 모니터링

## 📞 보안 문제 신고

보안 취약점을 발견한 경우 즉시 개발팀에 연락해주세요.
