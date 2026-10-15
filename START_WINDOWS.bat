@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo Pulse Board - Windows Development Launcher
echo ================================================
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 18+ and try again.
  pause
  exit /b 1
)
echo Installing root dependencies and the React client...
npm install
if errorlevel 1 (
  echo Root install failed. Trying the client install separately...
  npm run install:client
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
echo.
echo Starting Pulse Board...
npm run dev -- --host
