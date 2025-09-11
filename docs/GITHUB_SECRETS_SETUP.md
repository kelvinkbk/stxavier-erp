# 🔧 GitHub Secrets Setup Guide

This document explains how to configure GitHub repository secrets for the St. Xavier ERP CI/CD pipeline.

## 🎯 Overview

The CI/CD pipeline supports two modes:
- **Demo Mode**: Runs with placeholder Firebase config (when secrets are not configured)
- **Production Mode**: Uses real Firebase and Vercel secrets for deployment

## 📋 Required Secrets

### 🔥 Firebase Configuration
These secrets are required for production Firebase integration:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSyAXUmn2ZHX3s_ZqaxDwqGYxiDmKJUj-AY8` |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `stxavier-erp.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `stxavier-erp` |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `stxavier-erp.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | `1234567890` |
| `FIREBASE_APP_ID` | Firebase App ID | `1:1234567890:web:abcdef1234567890` |

### 🚀 Vercel Deployment (Optional)
These secrets enable automatic deployment to Vercel:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API Token | [Vercel Account Settings](https://vercel.com/account/tokens) |
| `ORG_ID` | Vercel Organization ID | Vercel Project Settings |
| `PROJECT_ID` | Vercel Project ID | Vercel Project Settings |

## 🛠️ How to Add Secrets

### Step 1: Navigate to Repository Settings
1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets
1. Click **New repository secret**
2. Enter the secret name (exactly as shown above)
3. Enter the secret value
4. Click **Add secret**
5. Repeat for all required secrets

### Step 3: Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → **Project settings**
4. Scroll down to **Your apps** section
5. Click on your web app or create one
6. Copy the config values from the `firebaseConfig` object

```javascript
// Example Firebase config (don't commit this!)
const firebaseConfig = {
  apiKey: "AIzaSyAXUmn2ZHX3s_ZqaxDwqGYxiDmKJUj-AY8",           // → FIREBASE_API_KEY
  authDomain: "stxavier-erp.firebaseapp.com",                    // → FIREBASE_AUTH_DOMAIN
  projectId: "stxavier-erp",                                     // → FIREBASE_PROJECT_ID
  storageBucket: "stxavier-erp.appspot.com",                     // → FIREBASE_STORAGE_BUCKET
  messagingSenderId: "1234567890",                               // → FIREBASE_MESSAGING_SENDER_ID
  appId: "1:1234567890:web:abcdef1234567890"                     // → FIREBASE_APP_ID
};
```

### Step 4: Get Vercel Configuration (Optional)
1. **Vercel Token**:
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token
   - Copy the token value

2. **Organization ID & Project ID**:
   - Import your project to Vercel
   - Go to Project Settings
   - Copy the values from the project settings

## 🔄 Pipeline Behavior

### Without Secrets (Demo Mode)
- ✅ Code quality checks run
- ✅ Build completes with demo Firebase config  
- ✅ Security scans run
- ❌ No deployment to production

### With Firebase Secrets
- ✅ All demo mode features
- ✅ Production build with real Firebase config
- ❌ Still no deployment (need Vercel secrets)

### With All Secrets
- ✅ All above features
- ✅ Automatic deployment to Vercel
- ✅ Full production pipeline

## 🚨 Security Best Practices

1. **Never commit secrets** to your repository
2. **Use environment-specific secrets** (dev/staging/prod)
3. **Regularly rotate API keys**
4. **Use least privilege principle** for service accounts
5. **Monitor secret usage** in GitHub Actions logs

## 🧪 Testing the Pipeline

### Test Demo Mode (No Secrets)
1. Push code to `main` branch
2. Check Actions tab → Pipeline should run in demo mode
3. Look for "🔧 Building in demo mode" in logs

### Test Production Mode (With Secrets)
1. Add Firebase secrets to repository
2. Push code to `main` branch  
3. Check Actions tab → Pipeline should use production config
4. Look for "🔥 Firebase: Production configuration detected"

### Test Full Deployment (All Secrets)
1. Add all secrets (Firebase + Vercel)
2. Push code to `main` branch
3. Check Actions tab → Should deploy to Vercel
4. Look for "🚀 Vercel: Deployment enabled"

## 🐛 Troubleshooting

### Common Issues

**"Context access might be invalid" warnings**
- ✅ Expected behavior - secrets don't exist yet
- ✅ Add the secrets to fix warnings

**Build fails in production mode**
- ❌ Check Firebase secret values
- ❌ Ensure Firebase project is configured correctly

**Deployment fails**
- ❌ Verify Vercel token has correct permissions
- ❌ Check project ID matches Vercel project

### Verification Commands

Test your Firebase config locally:
```bash
# Check if environment variables are loaded
npm run dev
# Should connect to Firebase without errors
```

Test build process:
```bash
# Test production build
npm run build:web
# Should complete without errors
```

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all secret names match exactly (case-sensitive)
3. Test Firebase connection locally first
4. Ensure all required environment variables are set

Remember: The pipeline is designed to work without secrets (demo mode), so you can gradually add secrets as needed! 🎯
