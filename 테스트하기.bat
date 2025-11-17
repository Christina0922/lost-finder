@echo off
chcp 65001 >nul
echo ========================================
echo   Genius Brain 게임 테스트 시작
echo ========================================
echo.

echo [1/4] 초기 데이터 확인 및 삽입...
cd server
if not exist game.db (
    echo    초기 데이터 삽입 중...
    call npm run init-game-data
    echo.
) else (
    echo    ✅ 데이터베이스 파일이 이미 존재합니다.
    echo.
)

echo [2/4] 서버 시작 중...
start "서버" cmd /k "cd /d %~dp0server && npm start"
timeout /t 3 /nobreak >nul
echo    ✅ 서버가 별도 창에서 실행됩니다.
echo.

echo [3/4] 클라이언트 시작 중...
start "클라이언트" cmd /k "cd /d %~dp0client && npm start"
timeout /t 3 /nobreak >nul
echo    ✅ 클라이언트가 별도 창에서 실행됩니다.
echo.

echo [4/4] 브라우저에서 접속 중...
timeout /t 5 /nobreak >nul
start http://localhost:3000/game
echo.

echo ========================================
echo   ✅ 준비 완료!
echo ========================================
echo.
echo   게임 페이지: http://localhost:3000/game
echo   메인 페이지: http://localhost:3000
echo.
echo   서버와 클라이언트가 실행 중입니다.
echo   브라우저 창을 닫지 마세요!
echo.
pause

