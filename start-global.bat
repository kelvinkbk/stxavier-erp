@echo off
title St. Xavier ERP - Local + Global Access

echo.
echo 🎓 St. Xavier ERP - Local + Global Startup
echo ==========================================
echo.

if "%1"=="deploy" goto deploy
if "%1"=="--deploy" goto deploy
if "%1"=="-d" goto deploy

:development
echo 📱 Starting Local + Global Development Mode...
echo.
echo This will start:
echo   ✅ Local development server (localhost)
echo   ✅ Global tunnel (accessible from anywhere)
echo   ✅ Network access (same WiFi)
echo   ✅ Mobile QR code
echo.

echo 🚀 Step 1: Starting local Expo server...
start /B "Expo Local" cmd /c "npx expo start --web"

echo ⏳ Waiting for local server to start...
timeout /t 10 /nobreak > nul

echo 🌐 Step 2: Starting global tunnel...
echo   This will provide a global URL accessible from anywhere!
echo.

call npx expo start --tunnel --web
goto end

:deploy
echo 🚀 Starting Deployment Mode...
echo.
echo 📦 Building web version...
call npm run build:web

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    goto end
)

echo ✅ Build completed!
echo.
echo ☁️ Deploying to Vercel...
call vercel --prod

if %errorlevel% equ 0 (
    echo ✅ Deployment completed!
    echo 🌐 Your app is now available globally!
) else (
    echo ❌ Deployment failed!
    echo 💡 Try: vercel login
)

goto end

:end
echo.
echo 🎉 All services started! 
echo    - Local: http://localhost:8081
echo    - Global: Check tunnel URL above
echo    - Network: http://192.168.29.204:8081
echo.
pause
