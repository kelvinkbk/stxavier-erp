# St. Xavier ERP - React Native App

A comprehensive ERP (Enterprise Resource Planning) system for educational institutions built with React Native, Expo, and Firebase.

## 🚀 All-in-One Quick Start Commands

### **Single Command Development & Testing:**

```bash
# Windows - All-in-One Development
.\start-all.bat

# Or using npm scripts
npm run dev

# Network testing with auto-IP detection
npm run test:network
```

### **Single Command Deployment:**

```bash
# Windows - Build & Deploy to Production
.\start-all.bat deploy

# Or using npm
npm run deploy
```

## 📱 Access Methods After Running

| Method | URL | Description |
|--------|-----|-------------|
| **Local Web** | `http://localhost:8081` | Development on same computer |
| **Network Web** | `http://192.168.29.204:8081` | Testing from other devices on same WiFi |
| **Mobile QR** | *Scan QR code in terminal* | Mobile testing via Expo Go app |
| **Production** | *Vercel URL after deploy* | Global access after deployment |

## 🎯 Quick Commands Summary

```bash
# Development (Local + Network)
.\start-all.bat                    # Windows all-in-one
npm run dev                        # Simple development
npm run test:network              # With network URL display

# Production Deployment  
.\start-all.bat deploy            # Windows build + deploy
npm run deploy                    # Build and deploy to Vercel

# Individual Commands
npm run web                       # Web only
npm run android                   # Android only  
npm run ios                       # iOS only
npm run build:web                 # Build for production
```

## Features

### 🔐 Authentication with Username Support
- **Login Options**: Email OR Username
- **Admin-Only Registration**: Only admins can create new users
- **Cross-Platform Sync**: Data syncs between web and mobile
- **Role-Based Access**: Admin > Faculty > Student hierarchy

### Core Modules
- **Authentication** - Admin, Faculty, and Student login with username support
- **User Management** - Admin can create/edit users with usernames
- **Student Records** - Profile management, courses, enrollment
- **Attendance** - Mark and view attendance records
- **Fees Management** - Invoice generation, payment tracking
- **Timetable** - Class schedules and management
- **Notices & Circulars** - Announcements and notifications
- **Exams & Marks** - Exam scheduling and result management
- **Library** - Book borrowing and return system
- **Events** - College event management

### Technical Features
- Cross-platform (iOS & Android & Web)
- Username and Email login support
- Real-time data synchronization
- Admin-controlled user registration
- Cross-platform user profile sync
- Secure authentication

## Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Authentication, AsyncStorage)
- **Navigation**: React Navigation v6
- **Language**: TypeScript
- **UI Components**: React Native built-in components
- **State Management**: React Context API
- **Storage**: AsyncStorage with cross-platform compatibility

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stxavier-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Get your Firebase configuration

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Firebase credentials

5. **Start development with all access methods**
   ```bash
   .\start-all.bat
   ```

## 🌐 Cross-Network Access Guide

### For Testing (Same WiFi):
```bash
# Start development server
.\start-all.bat

# Access from any device on same WiFi:
# Web: http://192.168.29.204:8081
# Mobile: Scan QR code with Expo Go app
```

### For Production (Global Access):
```bash
# Deploy to cloud
.\start-all.bat deploy

# Your app will be available globally via Vercel URL
```

### For Mobile Testing:
```bash
# Mobile users can:
# 1. Scan QR code displayed in terminal
# 2. Use Expo Go app to access via exp:// URL
# 3. Works across different networks
```

## Project Structure

```
stxavier-erp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   │   ├── Auth/           # Login, Register screens with username support
│   │   ├── Admin/          # Admin dashboard and user management
│   │   ├── Faculty/        # Faculty dashboard and features
│   │   └── Student/        # Student dashboard and features
│   ├── navigation/         # Navigation configuration
│   ├── services/           # AsyncStorage and business logic
│   │   └── localStorage.ts # User data management with username support
│   ├── utils/              # Helper functions and contexts
│   │   └── AuthContext.tsx # Cross-platform authentication
│   ├── types/              # TypeScript type definitions
│   └── firebase.ts         # Firebase configuration
├── scripts/                # Automation scripts
│   └── start-all.js       # All-in-one startup script
├── start-all.bat          # Windows batch script
├── start-all.ps1          # PowerShell script
├── App.tsx                # Main app component
└── package.json           # Enhanced with quick-start scripts
```

## User Roles and Permissions

### Admin
- Full system access
- **User management** (create, edit, delete users with usernames)
- Fee management
- System configuration
- Can register new users with email and username

### Faculty
- Mark attendance
- View assigned students
- Manage exams and marks
- View timetables
- Create/view notices

### Student
- View personal information
- Check attendance records
- View timetable
- Check fee status
- View exam results
- Access library records

## 🔑 Username System Features

### Login Process:
- Users can enter **either email OR username**
- System automatically detects input type
- Firebase authentication uses email internally
- Cross-platform profile synchronization

### User Creation (Admin Only):
- Admins create users with: Name, Email, Username, Password, Role
- Username uniqueness validation
- Automatic profile creation for cross-platform access

### Display:
- Usernames shown as `@username` in user lists
- Both email and username visible in user management
- Login screen accepts both formats

## Development

### All-in-One Development:
```bash
# Start everything at once
.\start-all.bat

# This provides:
# - Local development server
# - Network access URL
# - Mobile QR code
# - Cross-platform testing
```

### Individual Platform Testing:
```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

### Building for Production:
```bash
# Web deployment
.\start-all.bat deploy

# Mobile builds (requires EAS CLI)
npm install -g @expo/eas-cli
eas build --platform android
eas build --platform ios
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `.\start-all.bat` | All-in-one development startup (Windows) |
| `.\start-all.bat deploy` | Build and deploy to production |
| `npm run dev` | Start development server |
| `npm run deploy` | Build web and deploy to Vercel |
| `npm run test:network` | Show network URL and start dev |
| `npm run build:web` | Build web version for production |

## 🌐 Cross-Platform Compatibility

- **Web**: Full React Native Web support
- **iOS**: Native iOS app via Expo
- **Android**: Native Android app via Expo
- **Data Sync**: User profiles sync across all platforms
- **Username Support**: Works consistently on all platforms

## Upcoming Features

- [ ] Push notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app for parents
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Enhanced offline support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support and queries, please contact:
- Email: support@stxavier-erp.com
- Documentation: [Link to detailed docs]

## License

This project is licensed under the MIT License - see the LICENSE file for details.
#   s t x a v i e r - e r p  
 #   s t x a v i e r - e r p  
 