@echo off
cd /d "%~dp0"

echo Killing any stale dev servers on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080.*LISTENING" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting soundemote-site dev server...
echo.
echo Site will be available at: http://localhost:8080/
echo.
echo Press Ctrl+C to stop.
echo.
npm run dev
pause