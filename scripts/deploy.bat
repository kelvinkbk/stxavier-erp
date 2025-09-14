@echo off
echo Starting deployment of St. Xavier ERP...

echo Building application...
call npm run build:web

if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo Deploying to Vercel...
call npx vercel --prod

if errorlevel 0 (
    echo Successfully deployed to Vercel!
    echo Your app is live at: https://stxavier-erp.vercel.app
)

echo Deployment complete! Your ERP system is now running 24/7 in the cloud.
pause
