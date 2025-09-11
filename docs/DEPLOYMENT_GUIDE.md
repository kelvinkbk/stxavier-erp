# 🚀 St. Xavier ERP - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Firebase project created and configured
- [ ] Vercel account set up
- [ ] GitHub repository created
- [ ] Environment variables configured

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] Security audit passed
- [ ] Performance optimized
- [ ] Documentation updated

### ✅ Testing
- [ ] Web version tested
- [ ] Mobile version tested (iOS/Android)
- [ ] Cross-platform sync verified
- [ ] All user roles tested

## 🔧 Configuration Steps

### 1. Firebase Setup
```bash
# 1. Create Firebase project at console.firebase.google.com
# 2. Enable Authentication (Email/Password)
# 3. Create Firestore database
# 4. Set up security rules

# Update Firestore Rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - Admin control required
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // User lookup collection - Public read for username resolution
    match /user_lookup/{userId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections with authentication required
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Environment Configuration
```bash
# Copy and update environment file
cp .env.example .env

# Update with your Firebase credentials
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... etc
```

### 3. Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
npm run deploy

# Set environment variables in Vercel dashboard
# https://vercel.com/dashboard -> Project -> Settings -> Environment Variables
```

## 🌐 Production Deployment

### Web Deployment (Vercel)
```bash
# Build and deploy to production
npm run deploy

# Preview deployment
npm run deploy:preview

# Manual deployment
npm run build:web
vercel --prod
```

### Mobile Deployment

#### iOS (App Store)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

#### Android (Google Play)
```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

## 🔒 Security Configuration

### Firebase Security Rules
Apply these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin-controlled users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || isAdmin(request.auth.uid));
    }
    
    // Public username lookup
    match /user_lookup/{userId} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin(request.auth.uid);
    }
    
    // Student records
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (isAdmin(request.auth.uid) || isFaculty(request.auth.uid));
    }
    
    // Attendance records
    match /attendance/{recordId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (isAdmin(request.auth.uid) || isFaculty(request.auth.uid));
    }
    
    // Fee records
    match /fees/{feeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin(request.auth.uid);
    }
    
    // Helper functions
    function isAdmin(uid) {
      return get(/databases/$(database)/documents/users/$(uid)).data.role == 'admin';
    }
    
    function isFaculty(uid) {
      let userRole = get(/databases/$(database)/documents/users/$(uid)).data.role;
      return userRole == 'admin' || userRole == 'faculty';
    }
  }
}
```

### Firestore Indexes
Create these composite indexes in Firebase Console:

```
Collection: attendance
Fields: studentId (Ascending), date (Descending)

Collection: fees
Fields: studentId (Ascending), dueDate (Ascending)

Collection: students
Fields: course (Ascending), enrollmentYear (Descending)
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```bash
# Enable performance monitoring
EXPO_PUBLIC_PERFORMANCE_MONITORING=true

# Test performance
npm run performance:test

# Analyze bundle size
npm run performance:analyze
```

### Error Tracking
```bash
# Enable error reporting
EXPO_PUBLIC_ERROR_REPORTING=true

# View logs
npm run logs:security
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup
1. Add secrets to GitHub repository:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `VERCEL_TOKEN`
   - `ORG_ID`
   - `PROJECT_ID`

2. Pipeline will automatically:
   - Run code quality checks
   - Build and deploy web version
   - Check mobile builds
   - Run security scans
   - Monitor performance

## 🧪 Testing Production

### Web Testing
```bash
# Local production build
npm run build:web
npx serve dist

# Test on production URL
# https://your-app.vercel.app
```

### Mobile Testing
```bash
# Test via Expo
expo start --tunnel

# Test on physical devices
# Scan QR code with Expo Go app
```

### Cross-Platform Testing
1. Login on web
2. Login on mobile with same account
3. Create/modify data on one platform
4. Verify sync on other platform
5. Test offline → online sync

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean:all
npm install
npm run build:web
```

#### Firebase Permissions
```bash
# Run migrations
# Login as admin → Admin Dashboard → Run Migrations
```

#### Vercel Deployment
```bash
# Check environment variables
vercel env ls

# Redeploy
vercel --prod --force
```

#### Mobile Build Issues
```bash
# Doctor check
expo doctor

# Clear Expo cache
expo r -c

# Rebuild
eas build --platform all --clear-cache
```

## 📈 Post-Deployment

### Initial Setup
1. Deploy application
2. Create first admin user manually in Firebase
3. Login as admin
4. Run migrations from Admin Dashboard
5. Create faculty and student users
6. Configure system settings

### Maintenance
- Monitor performance metrics
- Review security logs
- Update dependencies regularly
- Backup user data
- Monitor Firebase usage

### Support
- GitHub Issues: https://github.com/kelvinkbk/stxavier-erp/issues
- Documentation: README.md
- Support Email: support@stxavier-erp.com

---

**🎉 Your St. Xavier ERP system is now production-ready!**
