// Debug utility for password viewing functionality
// This file helps debug any issues with the password viewing feature

export const debugPasswordFeature = () => {
  console.log('🔍 Debug: Password Viewing Feature Status');
  console.log('Platform:', require('react-native').Platform.OS);
  console.log('Firebase Auth available:', !!require('../firebase').auth);
  
  // Test platform-specific features
  if (require('react-native').Platform.OS === 'web') {
    console.log('Web platform detected - using prompt() for password input');
    console.log('Alert available:', typeof alert !== 'undefined');
    console.log('Confirm available:', typeof confirm !== 'undefined');
    console.log('Prompt available:', typeof prompt !== 'undefined');
  } else {
    console.log('Mobile platform detected - using Modal for password input');
    console.log('Alert from react-native available:', !!require('react-native').Alert);
  }
};

export const testPasswordVerification = async (adminEmail: string, testPassword: string) => {
  try {
    const { auth } = require('../firebase');
    const { EmailAuthProvider, reauthenticateWithCredential } = require('firebase/auth');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user found');
      return false;
    }
    
    console.log('🔍 Testing password verification...');
    console.log('Current user email:', currentUser.email);
    console.log('Admin email provided:', adminEmail);
    
    const credential = EmailAuthProvider.credential(adminEmail, testPassword);
    await reauthenticateWithCredential(currentUser, credential);
    
    console.log('✅ Password verification successful');
    return true;
  } catch (error: any) {
    console.error('❌ Password verification failed:', error.code, error.message);
    return false;
  }
};

export const debugModalDisplay = () => {
  console.log('🔍 Debug: Modal Display');
  console.log('Modal component available:', !!require('react-native').Modal);
  console.log('TouchableOpacity available:', !!require('react-native').TouchableOpacity);
  console.log('TextInput available:', !!require('react-native').TextInput);
};
