# 📱 Android Studio Setup Guide for St. Xavier ERP

## 🎯 Installing Android Studio for React Native/Expo Development

### ✅ **Current Project Status**
- **Project**: St. Xavier ERP System  
- **Framework**: React Native + Expo (SDK 46+)
- **Platform Support**: Web, iOS, Android
- **Current Features**: Complete user management, authentication, Firebase integration

---

## 🔧 **Android Studio Installation Steps**

### 1. **Download Android Studio**
- Go to: https://developer.android.com/studio
- Download the latest stable version
- **Recommended**: Android Studio Flamingo or newer

### 2. **Installation Requirements**
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 4GB free space
- **OS**: Windows 10/11 (64-bit)

### 3. **Installation Process**
1. Run the Android Studio installer
2. Choose **"Standard Installation"**
3. Accept all license agreements
4. Let it download required SDK components
5. **Important**: Install Android SDK, Android SDK Platform, and Android Virtual Device

---

## ⚙️ **Post-Installation Configuration**

### 1. **SDK Manager Setup**
1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. Install these SDK platforms:
   - **Android 13 (API 33)** ✅ Recommended
   - **Android 12 (API 31)**
   - **Android 11 (API 30)**

### 2. **Required SDK Tools**
Install these from SDK Tools tab:
- ✅ **Android SDK Build-Tools**
- ✅ **Android Emulator**
- ✅ **Android SDK Platform-Tools**
- ✅ **Google Play services**

### 3. **Environment Variables (Windows)**
Add these to your system PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

Set ANDROID_HOME environment variable:
```
ANDROID_HOME = C:\Users\[USERNAME]\AppData\Local\Android\Sdk
```

---

## 📱 **Create Android Virtual Device (AVD)**

### 1. **Open AVD Manager**
- In Android Studio: **Tools > AVD Manager**
- Or click the device icon in toolbar

### 2. **Create New Virtual Device**
1. Click **"+ Create Virtual Device"**
2. **Recommended devices**:
   - **Pixel 4** (Good for testing)
   - **Pixel 6 Pro** (Large screen testing)
   - **Nexus 5X** (Mid-range testing)

### 3. **Select System Image**
- Choose **API 33 (Android 13)** 
- Download if not already installed
- **Recommended**: Use Google APIs version

### 4. **Configure AVD**
- **RAM**: 2048 MB minimum
- **Internal Storage**: 2048 MB minimum
- **Enable**: Hardware keyboard, Webcam support

---

## 🚀 **Running Your ERP App on Android**

### 1. **Start Development Server**
```powershell
cd d:\erp\stxavier-erp
npx expo start
```

### 2. **Launch Android Emulator**
- Start your AVD from Android Studio
- Wait for it to fully boot up

### 3. **Connect Expo to Emulator**
In the Expo development server terminal:
- Press **'a'** to open on Android emulator
- Or scan QR code with Expo Go app

### 4. **Alternative: Physical Device**
1. **Enable Developer Options** on your Android device
2. **Enable USB Debugging**
3. Connect via USB
4. Install **Expo Go** app from Play Store
5. Scan QR code from development server

---

## 🔧 **Useful Android Studio Features for Your ERP**

### 1. **Device File Explorer**
- View app data and files
- Check AsyncStorage data
- Debug local storage issues

### 2. **Logcat (Debug Console)**
- View real-time logs from your app
- Filter by your app package name
- Debug Firebase and authentication issues

### 3. **Network Inspector**
- Monitor Firebase API calls
- Debug user management operations
- Check authentication requests

---

## 🎯 **Testing Your ERP Features on Android**

### **Core Features to Test:**

#### 🔐 **Authentication**
- [ ] Login with username/email
- [ ] Admin user creation
- [ ] Role-based navigation
- [ ] Session persistence

#### 👥 **User Management**
- [ ] View users list
- [ ] Edit user profiles
- [ ] Delete users
- [ ] Create new users
- [ ] Bulk operations

#### 📊 **Admin Dashboard**
- [ ] Performance monitoring
- [ ] Security logs
- [ ] Statistics display
- [ ] Navigation to screens

#### 🔄 **Data Sync**
- [ ] Firebase cloud sync
- [ ] Local storage fallback
- [ ] Offline functionality
- [ ] Real-time updates

---

## 🐛 **Troubleshooting Common Issues**

### **Emulator Won't Start**
```powershell
# Check if HAXM is enabled (Intel processors)
# Or enable Hyper-V (Windows 10/11)
# Check BIOS virtualization settings
```

### **App Won't Install**
```powershell
# Clear Expo cache
npx expo r -c

# Reset Metro bundler
npx expo start --clear
```

### **Performance Issues**
- Increase AVD RAM to 4GB
- Enable hardware acceleration
- Close unnecessary background apps

### **Firebase Connection Issues**
- Check internet connection
- Verify Firebase configuration
- Test on physical device if emulator has network issues

---

## 📱 **Recommended Emulator Settings for ERP Testing**

### **Configuration:**
- **API Level**: 33 (Android 13)
- **RAM**: 4096 MB
- **Storage**: 4096 MB
- **Resolution**: 1080 x 1920 (420 dpi)
- **Graphics**: Hardware - GLES 2.0

### **Advanced Settings:**
- ✅ **Enable snapshot** (faster startup)
- ✅ **Hardware keyboard support**
- ✅ **Webcam support** (for camera features)
- ✅ **Google Play Store** (for Expo Go)

---

## 🎉 **Next Steps After Installation**

1. **✅ Complete Android Studio setup**
2. **✅ Create and test AVD**
3. **✅ Run ERP app on emulator**
4. **✅ Test all user management features**
5. **✅ Test Firebase integration**
6. **✅ Test offline functionality**

---

## 📞 **Support Commands**

### **Check Android SDK Installation:**
```powershell
adb version
android --version  # (if SDK tools installed)
```

### **List Connected Devices:**
```powershell
adb devices
```

### **Start Emulator from Command Line:**
```powershell
emulator -list-avds
emulator @[AVD_NAME]
```

---

**🎯 Your ERP system is fully ready for Android development! Once Android Studio is installed, you'll be able to test all the user management, authentication, and admin features on Android devices and emulators.**
