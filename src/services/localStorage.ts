// src/services/localStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import CloudSyncService from './CloudSyncService';

export class LocalStorageService {
  private static cloudSync = CloudSyncService.getInstance();

  // Utility function to normalize dates when loading from storage
  static normalizeUserDates(user: any): User {
    if (user && user.createdAt) {
      try {
        if (typeof user.createdAt === 'string') {
          const parsedDate = new Date(user.createdAt);
          if (isNaN(parsedDate.getTime()) || parsedDate.getTime() < 0 || parsedDate.getTime() > 8640000000000000) {
            // Invalid date or out of bounds, use current date
            user.createdAt = new Date();
          } else {
            user.createdAt = parsedDate;
          }
        } else if (user.createdAt instanceof Date) {
          // Validate existing Date object
          if (isNaN(user.createdAt.getTime()) || user.createdAt.getTime() < 0 || user.createdAt.getTime() > 8640000000000000) {
            user.createdAt = new Date();
          }
        } else if (typeof user.createdAt === 'number') {
          // Handle timestamp
          const parsedDate = new Date(user.createdAt);
          if (isNaN(parsedDate.getTime()) || parsedDate.getTime() < 0 || parsedDate.getTime() > 8640000000000000) {
            user.createdAt = new Date();
          } else {
            user.createdAt = parsedDate;
          }
        } else {
          // Invalid type, use current date
          user.createdAt = new Date();
        }
      } catch (error) {
        console.warn('Date normalization error:', error);
        user.createdAt = new Date();
      }
    } else if (user) {
      // No createdAt field, add one
      user.createdAt = new Date();
    }
    return user as User;
  }

  // Utility function to safely convert any date-like value to Date
  static safeParseDate(dateValue: any): Date {
    if (!dateValue) return new Date();

    try {
      if (dateValue instanceof Date) {
        // Validate existing Date object
        if (isNaN(dateValue.getTime()) || dateValue.getTime() < 0 || dateValue.getTime() > 8640000000000000) {
          return new Date();
        }
        return dateValue;
      }

      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        const parsed = new Date(dateValue);
        // Check if date is valid and within reasonable bounds
        if (isNaN(parsed.getTime()) || parsed.getTime() < 0 || parsed.getTime() > 8640000000000000) {
          return new Date();
        }
        return parsed;
      }

      // Handle Firebase Timestamp objects
      if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
        const parsed = new Date(dateValue.seconds * 1000);
        if (isNaN(parsed.getTime()) || parsed.getTime() < 0 || parsed.getTime() > 8640000000000000) {
          return new Date();
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Date parsing error:', error);
    }

    return new Date();
  }

  // Enhanced user data storage with cloud sync
  static async saveUser(uid: string, userData: User): Promise<void> {
    try {
      // Save to local storage first
      await AsyncStorage.setItem(`user_${uid}`, JSON.stringify(userData));

      // Then sync to cloud
      try {
        await this.cloudSync.syncUserToCloud(userData);
        console.log('User saved and synced to cloud:', userData.email);
      } catch (cloudError) {
        console.warn('Failed to sync to cloud, data saved locally:', cloudError);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  // Enhanced user retrieval with cloud sync
  static async getUser(uid: string): Promise<User | null> {
    try {
      // Try to get from cloud first (ensures latest data)
      const cloudUser = await this.cloudSync.getUserFromCloud(uid);
      if (cloudUser) {
        return this.normalizeUserDates(cloudUser);
      }

      // Fallback to local storage
      const userData = await AsyncStorage.getItem(`user_${uid}`);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        return this.normalizeUserDates(parsedUser);
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      // Final fallback to local only
      try {
        const userData = await AsyncStorage.getItem(`user_${uid}`);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          return this.normalizeUserDates(parsedUser);
        }
        return null;
      } catch {
        return null;
      }
    }
  }

  static async removeUser(uid: string): Promise<void> {
    try {
      // Remove from both local and cloud
      await AsyncStorage.removeItem(`user_${uid}`);
      await this.cloudSync.deleteUserFromCloud(uid);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  }

  // Enhanced get all users with cloud sync
  static async getAllUsers(): Promise<User[]> {
    try {
      // Get from cloud first to ensure latest data
      const cloudUsers = await this.cloudSync.getAllUsersFromCloud();
      return cloudUsers.map(user => this.normalizeUserDates(user));
    } catch (error) {
      console.error('Error getting users from cloud, using local:', error);

      // Fallback to local storage
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const userKeys = allKeys.filter(key => key.startsWith('user_'));
        const userPromises = userKeys.map(async (key) => {
          const userData = await AsyncStorage.getItem(key);
          if (userData) {
            const parsedUser = JSON.parse(userData);
            return this.normalizeUserDates(parsedUser);
          }
          return null;
        });
        const users = await Promise.all(userPromises);
        return users.filter(user => user !== null);
      } catch (localError) {
        console.error('Error getting local users:', localError);
        return [];
      }
    }
  }

  // Enhanced get user by username with cloud sync
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      // Search in cloud first
      return await this.cloudSync.getUserByUsernameFromCloud(username);
    } catch (error) {
      console.error('Error getting user by username from cloud:', error);

      // Fallback to local search
      try {
        const allUsers = await this.getAllUsers();
        return allUsers.find(user => user.username === username) || null;
      } catch {
        return null;
      }
    }
  }

  // Enhanced get user by email with cloud sync
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      // Search in cloud first
      return await this.cloudSync.getUserByEmailFromCloud(email);
    } catch (error) {
      console.error('Error getting user by email from cloud:', error);

      // Fallback to local search
      try {
        const allUsers = await this.getAllUsers();
        return allUsers.find(user => user.email === email) || null;
      } catch {
        return null;
      }
    }
  }

  // Enhanced username availability check with cloud sync
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      // Check in cloud first
      return await this.cloudSync.isUsernameAvailableInCloud(username);
    } catch (error) {
      console.error('Error checking username availability in cloud:', error);

      // Fallback to local check
      try {
        const user = await this.getUserByUsername(username);
        return user === null;
      } catch {
        return false;
      }
    }
  }

  static async deleteUser(uid: string): Promise<void> {
    try {
      // Delete from both local and cloud
      await AsyncStorage.removeItem(`user_${uid}`);
      await this.cloudSync.deleteUserFromCloud(uid);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Manual sync trigger
  static async triggerSync(): Promise<void> {
    try {
      await this.cloudSync.triggerSync();
      console.log('Manual sync completed');
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    }
  }

  // Setup real-time sync for a user
  static setupRealtimeSync(uid: string, onUserUpdate: (user: User) => void): () => void {
    return this.cloudSync.setupRealtimeSync(uid, onUserUpdate);
  }

  // Get sync status
  static getSyncStatus() {
    return this.cloudSync.getSyncStatus();
  }

  // Sync user on login
  static async syncUserOnLogin(uid: string): Promise<User | null> {
    try {
      return await this.cloudSync.syncUserOnLogin(uid);
    } catch (error) {
      console.error('Failed to sync user on login:', error);
      // Fallback to local data
      return await this.getUser(uid);
    }
  }

  // Auto-refresh functionality
  static startAutoRefresh(intervalMs: number = 30000): void {
    this.cloudSync.startAutoRefresh(intervalMs);
  }

  static stopAutoRefresh(): void {
    this.cloudSync.stopAutoRefresh();
  }

  static getAutoRefreshStatus() {
    return this.cloudSync.getAutoRefreshStatus();
  }

  static setAutoRefreshInterval(intervalMs: number): void {
    this.cloudSync.setAutoRefreshInterval(intervalMs);
  }

  static async forceRefresh(): Promise<void> {
    await this.cloudSync.forceRefresh();
  }

  static onDataUpdate(callback: (data: any) => void): () => void {
    return this.cloudSync.onDataUpdate(callback);
  }

  // Generic data storage for other ERP features
  static async saveData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  static async getData(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }

  static async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  // Clear all data (for logout/reset)
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}
