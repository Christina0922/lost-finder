@echo off
title LostFinder 서버 + 클라이언트 실행

echo ✅ 서버를 실행합니다...
start cmd /k "cd /d %~dp0server && node server.js"

echo ✅ 클라이언트를 실행합니다...
start cmd /k "cd /d %~dp0client && npm start"

echo 🎉 모든 프로세스 실행 완료. 