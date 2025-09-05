@echo off
title St. Xavier ERP - Enhanced All-in-One Startup

echo.
echo 🎓 St. Xavier ERP - Enhanced All-in-One Startup
echo ================================================
echo.

if "%1"=="deploy" goto deploy
if "%1"=="--deploy" goto deploy
if "%1"=="-d" goto deploy
if "%1"=="check" goto healthcheck
if "%1"=="--check" goto healthcheck
if "%1"=="features" goto showfeatures

:development
echo 🔍 Detecting enhanced features...
echo.

if exist "src\services\SecurityService.ts" (
    echo ✅ Security enhancements available
) else (
    echo ❌ Security enhancements not found
)

if exist "src\services\PerformanceMonitor.ts" (
    echo ✅ Performance monitoring available
) else (
    echo ❌ Performance monitoring not found
)

if exist "src\services\advancedUserService.ts" (
    echo ✅ Advanced user management available
) else (
    echo ❌ Advanced user management not found
)

if exist "src\screens\AdminDashboard.tsx" (
    echo ✅ Admin dashboard available
) else (
    echo ❌ Admin dashboard not found
)

echo.
echo 📱 Starting Enhanced Development Mode with Global Access...
echo.
echo 🎯 Enhanced Features Available:
echo   🔐 Security: Password validation, rate limiting, audit logs
echo   📊 Performance: Load time tracking, network monitoring
echo   👥 User Management: Bulk import/export, advanced search
echo   🎛️  Admin Dashboard: Comprehensive system controls
echo.
echo 🌐 Available URLs after startup:
echo   Local Web:    http://localhost:8081
echo   Network Web:  http://192.168.29.204:8081
echo   Global Web:   Will show Expo tunnel URL below
echo   Mobile:       Scan QR code with Expo Go app
echo.
echo � Pro Tips:
echo   - Use Admin Dashboard for advanced features
echo   - Monitor performance through the dashboard
echo   - Check security logs for audit trails
echo   - Use bulk operations for user management
echo.
echo �🚀 Starting Expo server with enhanced features...
echo.

call npx expo start --web --tunnel
goto end

:healthcheck
echo 🏥 Running Enhanced Health Check...
echo.
call node scripts\enhanced-startup.js --check
goto end

:showfeatures
echo 🎯 Enhanced ERP Features
echo =======================
echo.
echo 🔐 SECURITY ENHANCEMENTS:
echo   • Password strength validation
echo   • Login rate limiting and account lockout
echo   • Comprehensive audit logging
echo   • Session management with timeout
echo   • Security event tracking
echo.
echo 📊 PERFORMANCE MONITORING:
echo   • Real-time load time tracking
echo   • Network latency monitoring
echo   • Screen performance analytics
echo   • Memory usage tracking
echo   • Performance data export
echo.
echo 👥 ADVANCED USER MANAGEMENT:
echo   • Bulk user import from CSV
echo   • Advanced search and filtering
echo   • User activity tracking
echo   • Bulk operations (update/delete)
echo   • Data export in CSV/JSON formats
echo.
echo 🎛️  ADMIN DASHBOARD:
echo   • Comprehensive user statistics
echo   • Real-time performance metrics
echo   • Security logs and monitoring
echo   • System health indicators
echo   • One-click bulk operations
echo.
echo 🚀 DEVELOPMENT TOOLS:
echo   • Enhanced startup scripts
echo   • Automatic feature detection
echo   • Environment health checks
echo   • Network configuration testing
echo   • Simplified deployment process
echo.
echo 📋 Usage Commands:
echo   start-all.bat           - Start with all features
echo   start-all.bat check     - Run health check
echo   start-all.bat features  - Show this feature list
echo   start-all.bat deploy    - Deploy to production
echo.
goto end

:deploy
echo 🚀 Starting Enhanced Deployment Mode...
echo.
echo � Pre-deployment checks...

if exist "src\services\SecurityService.ts" (
    echo ✅ Security features will be included
) else (
    echo ⚠️  Security features not found
)

if exist "src\services\PerformanceMonitor.ts" (
    echo ✅ Performance monitoring will be included
) else (
    echo ⚠️  Performance monitoring not found
)

echo.
echo �📦 Building enhanced web version...
call npm run build:web

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    echo 💡 Try running: npm install
    goto end
)

echo ✅ Build completed with enhanced features!
echo.
echo ☁️ Deploying to Vercel with all enhancements...
call vercel --prod

if %errorlevel% equ 0 (
    echo ✅ Enhanced deployment completed!
    echo 🌐 Your enhanced ERP app is now available globally!
    echo.
    echo 🎯 Enhanced Features Deployed:
    echo   • Security enhancements for user protection
    echo   • Performance monitoring for optimization
    echo   • Advanced user management capabilities
    echo   • Comprehensive admin dashboard
    echo.
    echo 📋 Next Steps:
    echo   - Share the Vercel URL with your team
    echo   - Access Admin Dashboard for management
    echo   - Monitor performance and security
    echo   - Use bulk operations for user setup
    echo   - Review security logs regularly
) else (
    echo ❌ Deployment failed!
    echo 💡 Troubleshooting:
    echo   - Try: vercel login
    echo   - Check internet connection
    echo   - Verify project permissions
    echo   - Run health check: start-all.bat check
)

goto end

:end
echo.
echo 💡 Quick Commands:
echo   start-all.bat           - Start development
echo   start-all.bat check     - Health check
echo   start-all.bat features  - Show features
echo   start-all.bat deploy    - Deploy to production
echo.
pause
