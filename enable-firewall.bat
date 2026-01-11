@echo off
echo ========================================
echo React Dev Server 방화벽 규칙 추가
echo ========================================
echo.

netsh advfirewall firewall delete rule name="React Dev Server" >nul 2>&1
netsh advfirewall firewall add rule name="React Dev Server" dir=in action=allow protocol=TCP localport=3000

if %errorlevel% equ 0 (
    echo [성공] 방화벽 규칙이 추가되었습니다!
    echo 이제 핸드폰에서 192.168.45.61:3000에 접근할 수 있습니다.
) else (
    echo [실패] 방화벽 규칙 추가에 실패했습니다.
    echo 이 파일을 "관리자 권한으로 실행"해주세요.
)

echo.
pause

