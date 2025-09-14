#!/usr/bin/env powershell
# Quick Setup Script for Always-Active Mobile App
# This prepares your app for mobile deployment

Write-Host "🚀 Setting up St. Xavier ERP for Always-Active Mobile Deployment" -ForegroundColor Green

# 1. Install EAS CLI globally
Write-Host "📦 Installing EAS CLI..." -ForegroundColor Yellow
npm install -g @expo/eas-cli

# 2. Check if logged into Expo
Write-Host "🔐 Checking Expo authentication..." -ForegroundColor Yellow
$loginStatus = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to your Expo account:" -ForegroundColor Red
    eas login
} else {
    Write-Host "✅ Already logged in as: $loginStatus" -ForegroundColor Green
}

# 3. Initialize EAS project
Write-Host "🏗️ Initializing EAS project..." -ForegroundColor Yellow
if (-not (Test-Path "eas.json")) {
    eas build:configure
} else {
    Write-Host "✅ EAS already configured" -ForegroundColor Green
}

# 4. Install mobile dependencies
Write-Host "📱 Installing mobile packages..." -ForegroundColor Yellow
npx expo install expo-notifications expo-background-fetch expo-task-manager expo-build-properties

# 5. Create production build (preview first)
Write-Host "🔨 Creating preview build for testing..." -ForegroundColor Cyan
Write-Host "This will generate QR codes you can scan to test on your phone" -ForegroundColor White

$buildChoice = Read-Host "Do you want to create a preview build now? (y/n)"
if ($buildChoice -eq "y" -or $buildChoice -eq "Y") {
    eas build --platform all --profile preview
    
    Write-Host "📱 QR codes generated! Scan them with:" -ForegroundColor Green
    Write-Host "- iOS: Camera app" -ForegroundColor Blue
    Write-Host "- Android: Expo Go app" -ForegroundColor Green
}

# 6. Display next steps
Write-Host "✅ Setup Complete! Your app is ready for always-active deployment" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test the preview build on your phone" -ForegroundColor White
Write-Host "2. When ready, run: .\scripts\deploy-mobile.ps1 -Platform both -BuildType production" -ForegroundColor White
Write-Host "3. Submit to app stores for approval" -ForegroundColor White
Write-Host ""
Write-Host "📖 Read the full guide: MOBILE-DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Your ERP app will soon be always active on mobile devices!" -ForegroundColor Green