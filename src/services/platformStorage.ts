// src/services/platformStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class PlatformStorageService {
  // Debug function to check what's stored
  static async debugStorage(): Promise<void> {
    try {
      console.log('=== Platform Storage Debug ===');
      console.log('Platform:', Platform.OS);
      
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All keys:', allKeys);
      
      for (const key of allKeys) {
        if (key.startsWith('user_')) {
          const value = await AsyncStorage.getItem(key);
          console.log(`${key}:`, JSON.parse(value || '{}'));
        }
      }
      console.log('=== End Debug ===');
    } catch (error) {
      console.error('Error debugging storage:', error);
    }
  }

  // Function to manually sync a user from one platform to another
  static async ensureUserExists(uid: string, userData: any): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(`user_${uid}`);
      if (!existing) {
        console.log('User not found on this platform, saving:', userData);
        await AsyncStorage.setItem(`user_${uid}`, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
    }
  }

  // Get platform info
  static getPlatformInfo(): string {
    return Platform.OS === 'web' ? 'web' : Platform.OS;
  }
}

export { PlatformStorageService };
