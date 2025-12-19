@echo off
title Push to GitHub - LostFinder
echo ========================================
echo Pushing LostFinder to GitHub
echo ========================================
echo.

cd /d %~dp0

echo Step 1: Checking Git status...
git status --short | findstr /V "node_modules" | findstr /V ".gradle" | findstr /V "build" | findstr /V ".idea"
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Checking remote...
git remote -v
echo.

echo Step 4: Committing changes...
git commit -m "feat: 글로벌 서비스 확장 - i18n 다국어 지원, 카드형 UI, 아마존 어소시에이트 수익화, SEO 최적화

- i18n 다국어 시스템 구축 (한국어/영어/일본어)
- 카드형 그리드 레이아웃으로 UI 개선 (Pinterest 스타일)
- 무한 스크롤 기능 구현 (Intersection Observer)
- 위치 모호화 로직 (GDPR 준수)
- 아마존 어소시에이트 수익화 컴포넌트 추가
- SEO 최적화 (react-helmet-async)
- 국가별 날짜 포맷터 구현 (date-fns)
- 반응형 디자인 및 성능 최적화 (Skeleton UI)
- 언어 선택 기능 추가 (헤더 설정)"
echo.

echo Step 5: Pushing to GitHub...
git branch
echo.
echo Which branch? (main/master)
set /p branch="Enter branch name (default: main): "
if "%branch%"=="" set branch=main

git push -u origin %branch%

echo.
echo ========================================
echo Done!
echo ========================================
pause

