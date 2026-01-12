# LostFinder 브랜드 로고

## 📂 파일 구조

```
branding/
├── logo-mark.svg          # 심볼 단독 로고 (지도핀 + 돋보기)
├── logo-lockup.svg        # 워드마크 포함 로고 (심볼 + "LostFinder" 텍스트)
├── png/                   # PNG 버전 (생성 필요)
│   ├── logo-mark-1024.png
│   └── logo-lockup-1024.png
└── icons/                 # 앱 아이콘용 (생성 필요)
    ├── app-icon-512.png
    ├── app-icon-192.png
    ├── app-icon-128.png
    ├── app-icon-64.png
    ├── app-icon-48.png
    ├── favicon-32.png
    └── favicon-16.png
```

## 🎨 로고 디자인 컨셉

### 심볼 구성
- **지도 핀** (메인): 위치 기반 서비스 상징
- **돋보기** (보조): 찾기/검색 기능 강조
- **느낌표** (악센트): 긴급성과 발견의 순간

### 컬러 팔레트
- **Primary Blue** `#4A90E2`: 신뢰감, 안전
- **Secondary Blue** `#357ABD`: 보조 색상
- **Accent Orange** `#F5A623`: 강조 포인트
- **Text Dark** `#2C3E50`: 텍스트

## 📐 사용 가이드

### 심볼 로고 (logo-mark.svg)
- 정사각형 아이콘이 필요한 모든 곳
- 앱 아이콘, 파비콘, SNS 프로필
- 최소 크기: 48x48px

### 워드마크 로고 (logo-lockup.svg)
- 가로로 긴 공간 (헤더, 푸터, 명함)
- 웹사이트 네비게이션 바
- 최소 크기: 200x64px

## 🔧 PNG 생성 방법

현재 SVG 파일만 제공되어 있습니다. PNG를 생성하려면:

### 방법 1: 온라인 변환기 사용
1. https://cloudconvert.com/svg-to-png 접속
2. `logo-mark.svg` 업로드
3. 원하는 크기로 변환 (1024px 권장)
4. `branding/png/` 폴더에 저장

### 방법 2: Inkscape/Illustrator
1. SVG 파일 열기
2. Export as PNG
3. 크기별로 저장

### 필요한 PNG 파일 목록
- ✅ logo-mark-1024.png (고해상도 마스터)
- ✅ logo-lockup-1024.png (고해상도 마스터)
- ✅ app-icon-512.png (PWA/Android)
- ✅ app-icon-192.png (PWA)
- ✅ app-icon-128.png (Chrome)
- ✅ app-icon-64.png (소형 아이콘)
- ✅ app-icon-48.png (브라우저 즐겨찾기)
- ✅ favicon-32.png (표준 파비콘)
- ✅ favicon-16.png (최소 파비콘)

## 📱 Android 앱 아이콘 적용

Android 앱 아이콘은 이미 Vector Drawable로 적용되어 있습니다:

```
app/src/main/res/
├── drawable/
│   └── ic_launcher_foreground.xml  # 로고 벡터
├── mipmap-anydpi-v26/
│   └── ic_launcher.xml              # Adaptive icon
└── values/
    └── ic_launcher_background.xml   # 배경색 (흰색)
```

새로 빌드하면 홈 화면에 새 아이콘이 적용됩니다.

## ✅ 체크리스트

- [x] 심볼 로고 SVG 제작
- [x] 워드마크 로고 SVG 제작
- [ ] PNG 변환 (1024px)
- [ ] 앱 아이콘 PNG 세트 생성
- [ ] 파비콘 PNG 생성
- [x] Android 앱 아이콘 리소스 적용
- [ ] 웹 manifest.json에 아이콘 등록 (필요시)

## 🎯 품질 검수 포인트

✅ **형태 인식**
- 1cm 크기에서도 "핀+돋보기" 형태 명확히 보임
- 선이 너무 얇지 않음 (최소 8px stroke)

✅ **색상**
- 파란색 계열로 신뢰감 전달
- 주황 악센트가 과하지 않음

✅ **여백**
- 심볼 주변 충분한 여백 (안전 영역)
- 가장자리 잘림 없음

✅ **확장성**
- SVG이므로 무한 확대 가능
- 16px ~ 1024px 모든 크기 지원

## 📄 라이선스

이 로고는 LostFinder 서비스 전용입니다.

