# Genius Brain - LostFinder Project

분실물 찾기 웹 애플리케이션 + 두뇌 훈련 게임 플랫폼

## 🎮 새로운 기능: 두뇌 훈련 게임

이 프로젝트에는 이제 두 가지 교육 게임이 포함되어 있습니다:

1. **한글 맞춤법 퀴즈** - 초등학생을 위한 맞춤법 학습 게임
2. **영어 단어 순서 맞추기** - 영어 문장 구조 학습 게임

### 게임 특징
- 🪙 코인 시스템 (정답 시 보상, 힌트 사용)
- 🛒 인앱 결제 (광고 제거, 코인 구매)
- 📚 쿠팡 파트너스 광고 연동
- 📊 진행 상황 추적 및 저장

## 프로젝트 구조

```
LostFinderProject/
├── client/          # React 클라이언트
├── server/          # Node.js 서버
├── .gitignore      # Git 무시 파일
└── README.md       # 프로젝트 설명
```

## 설치 및 실행

### 서버 실행
```bash
cd server
npm install
cp env.example .env  # 환경변수 파일 복사 후 수정
npm run init-game-data  # 게임 초기 데이터 삽입 (최초 1회만 실행)
npm start
```

**중요**: 게임을 처음 사용하기 전에 반드시 `npm run init-game-data`를 실행하여 초기 퍼즐 데이터를 데이터베이스에 삽입해야 합니다.

### 클라이언트 실행
```bash
cd client
npm install
npm start
```

## 환경변수 설정

### 로컬 개발
서버 디렉토리의 `env.example` 파일을 `.env`로 복사한 후 다음 값들을 설정하세요:

- `TEST_EMAIL`: 테스트용 이메일 주소
- `TEST_PW`: 테스트용 비밀번호
- `JWT_SECRET`: JWT 토큰 암호화 키
- `DB_*`: 데이터베이스 연결 정보
- `EMAIL_*`: 이메일 발송 설정
- `SMS_*`: SMS 발송 설정

### Vercel 배포
Vercel 대시보드에서 다음 환경변수들을 설정하세요:

- `TEST_EMAIL`: 테스트용 이메일 주소
- `TEST_PW`: 테스트용 비밀번호
- `JWT_SECRET`: JWT 토큰 암호화 키
- `NODE_ENV`: production

## 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 실제 운영 환경에서는 강력한 비밀번호와 키를 사용하세요
- 민감한 정보는 환경변수로 관리하세요

## Vercel 배포

1. GitHub 저장소를 Vercel에 연결
2. 환경변수 설정 (위의 Vercel 배포 섹션 참조)
3. 자동 배포 완료

배포 URL: `https://your-project-name.vercel.app`

## 기능

- 분실물 등록 및 조회
- 이미지 업로드
- 사용자 인증
- 비밀번호 재설정
- 댓글 시스템
- 지도 연동