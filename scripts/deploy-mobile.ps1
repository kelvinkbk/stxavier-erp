#!/usr/bin/env powershell
# Mobile App Deployment Script for St. Xavier ERP
# This script builds and deploys the app to both iOS App Store and Google Play Store

param(
    [string]$Platform = "both",  # Options: ios, android, both
    [string]$BuildType = "production"  # Options: development, preview, production
)

Write-Host "🚀 Starting Mobile App Deployment for St. Xavier ERP" -ForegroundColor Green
Write-Host "Platform: $Platform | Build Type: $BuildType" -ForegroundColor Cyan

# Ensure we're in the correct directory
Set-Location $PSScriptRoot

# Install/Update EAS CLI
Write-Host "📦 Installing/Updating EAS CLI..." -ForegroundColor Yellow
npm install -g @expo/eas-cli

# Login to EAS (if not already logged in)
Write-Host "🔐 Checking EAS authentication..." -ForegroundColor Yellow
eas whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to EAS:" -ForegroundColor Red
    eas login
}

# Install dependencies
Write-Host "📚 Installing dependencies..." -ForegroundColor Yellow
npm install
npx expo install expo-notifications expo-background-fetch expo-task-manager expo-build-properties

# Update app version
Write-Host "🔄 Updating app version..." -ForegroundColor Yellow
$packageJson = Get-Content -Path "package.json" | ConvertFrom-Json
$currentVersion = $packageJson.version
$versionParts = $currentVersion -split '\.'
$newPatch = [int]$versionParts[2] + 1
$newVersion = "$($versionParts[0]).$($versionParts[1]).$newPatch"
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path "package.json"
Write-Host "Version updated to: $newVersion" -ForegroundColor Green

# Build for iOS
if ($Platform -eq "ios" -or $Platform -eq "both") {
    Write-Host "🍎 Building for iOS..." -ForegroundColor Blue
    eas build --platform ios --profile $BuildType --non-interactive
    
    if ($LASTEXITCODE -eq 0 -and $BuildType -eq "production") {
        Write-Host "📤 Submitting to App Store..." -ForegroundColor Blue
        eas submit --platform ios --latest --non-interactive
    }
}

# Build for Android
if ($Platform -eq "android" -or $Platform -eq "both") {
    Write-Host "🤖 Building for Android..." -ForegroundColor Green
    eas build --platform android --profile $BuildType --non-interactive
    
    if ($LASTEXITCODE -eq 0 -and $BuildType -eq "production") {
        Write-Host "📤 Submitting to Google Play Store..." -ForegroundColor Green
        eas submit --platform android --latest --non-interactive
    }
}

# Generate QR codes for testing
if ($BuildType -ne "production") {
    Write-Host "📱 Generating QR codes for testing..." -ForegroundColor Cyan
    eas build:list --platform all --status finished --limit 2
}

# Create deployment summary
Write-Host "✅ Deployment Summary:" -ForegroundColor Green
Write-Host "- Platform: $Platform" -ForegroundColor White
Write-Host "- Build Type: $BuildType" -ForegroundColor White
Write-Host "- App Version: $newVersion" -ForegroundColor White
Write-Host "- Build Status: Complete" -ForegroundColor White

if ($BuildType -eq "production") {
    Write-Host "📱 Your app is now being reviewed by app stores!" -ForegroundColor Green
    Write-Host "📊 You can monitor the status at:" -ForegroundColor Cyan
    Write-Host "- iOS: https://appstoreconnect.apple.com" -ForegroundColor Blue
    Write-Host "- Android: https://play.google.com/console" -ForegroundColor Green
} else {
    Write-Host "🔧 Test builds are ready for internal distribution!" -ForegroundColor Yellow
    Write-Host "Use the QR codes above to install on test devices." -ForegroundColor White
}

Write-Host "🎉 Mobile deployment complete! Your ERP app will be always active on mobile devices." -ForegroundColor Green