# 🚀 Always-Active Mobile App Deployment Guide

### St. Xavier ERP - Mobile App Store Deployment

This guide will help you deploy your ERP app to iOS App Store and Google Play Store, making it **always active** on mobile devices even when your laptop is shut down.

## 📱 What This Achieves

✅ **Always Active**: App runs independently on mobile devices
✅ **Background Sync**: Data syncs automatically in background
✅ **Push Notifications**: Users get instant updates
✅ **Offline Capability**: Works even without internet
✅ **Auto Updates**: App updates automatically from stores
✅ **24/7 Availability**: No dependency on your laptop

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │───▶│  Cloud Backend  │───▶│   Firebase DB   │
│   (iOS/Android) │    │   (Vercel)      │    │   (Always On)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
  Background Tasks         API Endpoints           Real-time Sync
  Push Notifications       User Management         Data Storage
  Offline Storage          Authentication          File Storage
```

## 🛠️ Prerequisites

### 1. Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

### 2. Create Expo Account

```bash
eas login
```

### 3. iOS Requirements (for App Store)

- Apple Developer Account ($99/year)
- Mac computer (for iOS builds) OR use EAS Build cloud service
- App Store Connect access

### 4. Android Requirements (for Play Store)

- Google Play Console account ($25 one-time fee)
- Google Service Account JSON file

## 📦 Step 1: Configure App for Production

### Update App Metadata

Your `app.json` has been configured with:

- Bundle identifiers for both platforms
- Background modes for always-active functionality
- Push notification capabilities
- Auto-update configuration

### Background Services

Your app now includes:

- **BackgroundService.ts**: Handles background tasks
- **Push notifications**: For real-time updates
- **Background fetch**: For data synchronization
- **Task manager**: For scheduled operations

## 🚀 Step 2: Build and Deploy

### Option A: Use PowerShell Script (Windows)

```powershell
# Build for both platforms (production)
.\scripts\deploy-mobile.ps1 -Platform both -BuildType production

# Build for iOS only
.\scripts\deploy-mobile.ps1 -Platform ios -BuildType production

# Build for Android only
.\scripts\deploy-mobile.ps1 -Platform android -BuildType production

# Build preview/test version
.\scripts\deploy-mobile.ps1 -Platform both -BuildType preview
```

### Option B: Use Bash Script (Linux/Mac)

```bash
# Build for both platforms (production)
./scripts/deploy-mobile.sh both production

# Build for iOS only
./scripts/deploy-mobile.sh ios production

# Build for Android only
./scripts/deploy-mobile.sh android production

# Build preview/test version
./scripts/deploy-mobile.sh both preview
```

### Option C: Manual EAS Commands

```bash
# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform all --latest

# Build for testing
eas build --platform all --profile preview
```

## 📊 Step 3: App Store Setup

### iOS App Store (App Store Connect)

1. Create new app in App Store Connect
2. Upload screenshots and app description
3. Set pricing (free)
4. Submit for review
5. Approval typically takes 1-3 days

### Android Play Store (Google Play Console)

1. Create new app in Play Console
2. Upload APK/AAB file
3. Complete store listing
4. Set up content rating
5. Publish to production

## 🔧 Step 4: Configure Always-Active Features

### Push Notifications

```typescript
// Your app now automatically:
- Sends daily reminders
- Notifies about fee updates
- Alerts for important announcements
- Syncs data in background
```

### Background Sync

```typescript
// Automatic background operations:
- Sync user data every 15 minutes
- Check for updates hourly
- Cache critical data offline
- Send status notifications
```

## 📱 Step 5: Testing Your Always-Active App

### Internal Testing

1. Use Expo Go app for quick testing
2. Build preview version for internal distribution
3. Test background functionality
4. Verify push notifications work

### Production Testing

1. Download from app stores
2. Test with app closed/in background
3. Verify notifications arrive
4. Check data synchronization

## 🌟 Always-Active Features Explained

### 1. Background App Refresh

- App fetches new data every 15 minutes
- Works even when app is closed
- Updates attendance, fees, notices automatically

### 2. Push Notifications

- Instant alerts for important updates
- Daily reminders for pending tasks
- Emergency announcements
- Fee payment reminders

### 3. Offline Capability

- Critical data cached locally
- Works without internet
- Syncs when connection restored
- Seamless offline/online transition

### 4. Auto Updates

- App updates automatically from stores
- No need to rebuild/redeploy manually
- Users always have latest version
- Bug fixes pushed instantly

## 🎯 Expected Timeline

### Initial Deployment

- **Build Time**: 10-15 minutes
- **iOS Review**: 1-3 days
- **Android Review**: 2-5 hours
- **Total**: 2-4 days for approval

### Updates

- **Build Time**: 5-10 minutes
- **OTA Updates**: Instant (for JS changes)
- **Binary Updates**: Same review process

## 📋 Maintenance Checklist

### Weekly

- [ ] Check app store reviews
- [ ] Monitor crash reports
- [ ] Verify background sync working

### Monthly

- [ ] Update app version
- [ ] Review analytics
- [ ] Update content/features
- [ ] Check notification delivery

## 🎉 Success Metrics

After deployment, your app will:

- ✅ Work 24/7 on all user devices
- ✅ Sync data automatically
- ✅ Send real-time notifications
- ✅ Function offline
- ✅ Update automatically
- ✅ Be completely independent of your laptop

## 🔗 Important Links

- **EAS Build Dashboard**: https://expo.dev/accounts/[your-account]/projects/stxavier-erp
- **iOS App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console
- **Firebase Console**: https://console.firebase.google.com
- **Live Web App**: https://stxavier-erp.vercel.app

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and retry
expo r -c
eas build --platform all --profile production --clear-cache
```

### Notifications Not Working

```bash
# Check permissions and token
eas credentials:manager
```

### Background Sync Issues

```bash
# Verify background modes in app.json
# Check Firebase rules and permissions
```

---

**🎯 Ready to Deploy?** Run the deployment script and make your ERP app always active on mobile devices!

```powershell
.\scripts\deploy-mobile.ps1 -Platform both -BuildType production
```
