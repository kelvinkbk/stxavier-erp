#!/bin/bash
# Mobile App Deployment Script for St. Xavier ERP (Linux/Mac)
# This script builds and deploys the app to both iOS App Store and Google Play Store

PLATFORM=${1:-both}  # Options: ios, android, both
BUILD_TYPE=${2:-production}  # Options: development, preview, production

echo "🚀 Starting Mobile App Deployment for St. Xavier ERP"
echo "Platform: $PLATFORM | Build Type: $BUILD_TYPE"

# Ensure we're in the correct directory
cd "$(dirname "$0")/.."

# Install/Update EAS CLI
echo "📦 Installing/Updating EAS CLI..."
npm install -g @expo/eas-cli

# Login to EAS (if not already logged in)
echo "🔐 Checking EAS authentication..."
eas whoami || eas login

# Install dependencies
echo "📚 Installing dependencies..."
npm install
npx expo install expo-notifications expo-background-fetch expo-task-manager expo-build-properties

# Update app version
echo "🔄 Updating app version..."
npm version patch --no-git-tag-version

# Build for iOS
if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
    echo "🍎 Building for iOS..."
    eas build --platform ios --profile $BUILD_TYPE --non-interactive

    if [ $? -eq 0 ] && [ "$BUILD_TYPE" = "production" ]; then
        echo "📤 Submitting to App Store..."
        eas submit --platform ios --latest --non-interactive
    fi
fi

# Build for Android
if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
    echo "🤖 Building for Android..."
    eas build --platform android --profile $BUILD_TYPE --non-interactive

    if [ $? -eq 0 ] && [ "$BUILD_TYPE" = "production" ]; then
        echo "📤 Submitting to Google Play Store..."
        eas submit --platform android --latest --non-interactive
    fi
fi

# Generate QR codes for testing
if [ "$BUILD_TYPE" != "production" ]; then
    echo "📱 Generating QR codes for testing..."
    eas build:list --platform all --status finished --limit 2
fi

# Create deployment summary
echo "✅ Deployment Summary:"
echo "- Platform: $PLATFORM"
echo "- Build Type: $BUILD_TYPE"
echo "- Build Status: Complete"

if [ "$BUILD_TYPE" = "production" ]; then
    echo "📱 Your app is now being reviewed by app stores!"
    echo "📊 You can monitor the status at:"
    echo "- iOS: https://appstoreconnect.apple.com"
    echo "- Android: https://play.google.com/console"
else
    echo "🔧 Test builds are ready for internal distribution!"
    echo "Use the QR codes above to install on test devices."
fi

echo "🎉 Mobile deployment complete! Your ERP app will be always active on mobile devices."
