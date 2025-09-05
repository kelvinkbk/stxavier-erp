# 🎓 St. Xavier ERP System - 100% FREE Setup

A comprehensive Educational Resource Planning (ERP) system built with React Native, Expo, and Firebase.

## 🆓 **COMPLETELY FREE SOLUTION**

This project uses **Firebase Authentication** (free) + **Local Storage** (free) - **NO BILLING OR CREDIT CARD REQUIRED!**

## 🚀 **Quick Start**

### Step 1: Firebase Setup (FREE)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: `stxavier-erp`
3. Enable **Authentication** → **Sign-in method** → **Email/Password** ✅
4. Get your web app config from **Project Settings** → **General** → **Your apps**

### Step 2: Configure Environment
1. Copy your Firebase config
2. Update `.env` file with your Firebase credentials:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 3: Run the App
```bash
npm install
npm start
```
Scan QR code with Expo Go app!

## ✨ **Features**

- 🔐 **Authentication**: Login/Register (Firebase Auth - FREE)
- 👥 **Role-based Access**: Admin, Faculty, Student dashboards
- 📱 **Mobile-first**: React Native with Expo
- 💾 **Local Storage**: No database charges - uses device storage
- 🎨 **Modern UI**: Custom components and responsive design
- 📊 **Student Records**: Profile management
- 📝 **Attendance System**: Mark and track attendance
- 💰 **Fee Management**: Payment tracking
- 📅 **Timetable**: Class schedules
- 📢 **Notices**: Announcements
- 📚 **Exams & Marks**: Result management

## 🏗️ **Architecture**

- **Frontend**: React Native + Expo
- **Authentication**: Firebase Auth (Free tier)
- **Database**: AsyncStorage (Local device storage - FREE)
- **State Management**: React Context
- **Navigation**: React Navigation v7
- **Language**: TypeScript

## 💰 **Cost Breakdown**

| Service | Free Tier | Cost |
|---------|-----------|------|
| Firebase Authentication | 50,000 monthly active users | **$0.00** ✅ |
| Local Storage | Unlimited (device storage) | **$0.00** ✅ |
| Expo Development | Full development suite | **$0.00** ✅ |
| **Total Monthly Cost** | | **$0.00** 🎉 |

## 🔧 **Why This Setup?**

- ❌ **No billing setup required**
- ❌ **No credit card needed**
- ❌ **No database configuration**
- ❌ **No server costs**
- ✅ **Just Firebase Auth + local device storage**
- ✅ **Perfect for development and small-scale deployment**

## 📝 **Usage**

1. **Register** with email/password
2. **Choose role**: Student, Faculty, or Admin
3. **Access** role-specific dashboard
4. **All data** stored locally on device (offline-capable!)

## 🎯 **Project Structure**

```
src/
├── components/         # Custom UI components (Button, Card)
├── navigation/        # Role-based navigation
├── screens/          # Screen components
│   ├── Auth/         # Login, Register
│   ├── Admin/        # Admin dashboard
│   ├── Faculty/      # Faculty dashboard
│   └── Student/      # Student dashboard
├── services/         # Local storage service
├── types/           # TypeScript definitions
├── utils/           # Auth context
└── firebase.ts      # Firebase config (auth only)
```

## 🛠️ **Development Commands**

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Type checking
npx tsc --noEmit
```

## 🔑 **Firebase Setup Details**

1. **Create Project**: Go to Firebase Console → Add Project
2. **Enable Auth**: Authentication → Get Started → Email/Password → Enable
3. **Get Config**: Project Settings → General → Your apps → Add web app
4. **Copy Config**: Use only these 4 values (no database needed):
   - apiKey
   - authDomain  
   - projectId
   - appId

## 🎉 **Ready to Use!**

No complex setup, no billing worries, no database configuration. Just pure authentication + local storage for a fully functional ERP system!

---

**Made with ❤️ for educational institutions wanting a FREE ERP solution**
