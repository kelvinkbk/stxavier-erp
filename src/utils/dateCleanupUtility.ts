// src/utils/dateCleanupUtility.ts
// Utility to fix date value out of bounds issues

import CloudSyncService from '../services/CloudSyncService';
import { LocalStorageService } from '../services/localStorage';

export class DateCleanupUtility {
  private static cloudSync = CloudSyncService.getInstance();

  /**
   * Clean up all user data with invalid dates
   */
  static async cleanupInvalidDates(): Promise<void> {
    console.log('🧹 Starting date cleanup utility...');

    try {
      // Get all users from local storage
      const allUsers = await LocalStorageService.getAllUsers();
      let cleanedCount = 0;

      for (const user of allUsers) {
        let needsUpdate = false;
        const cleanedUser = { ...user };

        // Check and fix createdAt field
        if (cleanedUser.createdAt) {
          try {
            const date = cleanedUser.createdAt instanceof Date
              ? cleanedUser.createdAt
              : new Date(cleanedUser.createdAt);

            // Check if date is out of bounds (JavaScript Date limits)
            if (isNaN(date.getTime()) ||
                date.getTime() < 0 ||
                date.getTime() > 8640000000000000 || // Max safe date value
                date.getFullYear() < 1970 ||
                date.getFullYear() > 2100) {
              console.warn(`⚠️ Invalid createdAt date for user ${user.uid}:`, cleanedUser.createdAt);
              cleanedUser.createdAt = new Date();
              needsUpdate = true;
            } else {
              cleanedUser.createdAt = date;
            }
          } catch (error) {
            console.warn(`❌ Date parsing error for user ${user.uid}:`, error);
            cleanedUser.createdAt = new Date();
            needsUpdate = true;
          }
        } else {
          // Add missing createdAt
          cleanedUser.createdAt = new Date();
          needsUpdate = true;
        }

        // Check any other date fields that might exist
        Object.keys(cleanedUser).forEach(key => {
          if (key.includes('Date') || key.includes('Time') || key === 'lastLogin') {
            try {
              const value = (cleanedUser as any)[key];
              if (value && typeof value === 'string' && value.includes('T')) {
                const date = new Date(value);
                if (isNaN(date.getTime()) ||
                    date.getTime() < 0 ||
                    date.getTime() > 8640000000000000) {
                  console.warn(`⚠️ Invalid ${key} for user ${user.uid}:`, value);
                  delete (cleanedUser as any)[key];
                  needsUpdate = true;
                }
              }
            } catch (error) {
              console.warn(`❌ Error checking ${key} for user ${user.uid}:`, error);
              delete (cleanedUser as any)[key];
              needsUpdate = true;
            }
          }
        });

        if (needsUpdate) {
          await LocalStorageService.saveUser(cleanedUser.uid, cleanedUser);
          cleanedCount++;
          console.log(`✅ Cleaned up dates for user: ${user.uid}`);
        }
      }

      console.log(`🎯 Date cleanup completed: ${cleanedCount} users updated`);
    } catch (error) {
      console.error('❌ Error during date cleanup:', error);
    }
  }

  /**
   * Clean up pending sync queue with invalid dates
   */
  static async cleanupPendingSyncDates(): Promise<void> {
    try {
      console.log('🧹 Cleaning up pending sync queue dates...');

      // This is a more complex operation that would require accessing
      // the private pendingSyncQueue from CloudSyncService
      // For now, we'll trigger a sync which will use the improved date handling
      await this.cloudSync.forceRefresh();

      console.log('✅ Pending sync dates cleanup triggered');
    } catch (error) {
      console.error('❌ Error cleaning up pending sync dates:', error);
    }
  }

  /**
   * Validate a date value and return a safe date
   */
  static validateDate(dateValue: any, fallback: Date = new Date()): Date {
    if (!dateValue) return fallback;

    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

      // Check bounds and validity
      if (isNaN(date.getTime()) ||
          date.getTime() < 0 ||
          date.getTime() > 8640000000000000 ||
          date.getFullYear() < 1970 ||
          date.getFullYear() > 2100) {
        return fallback;
      }

      return date;
    } catch (error) {
      console.warn('Date validation error:', error);
      return fallback;
    }
  }

  /**
   * Run full date cleanup process
   */
  static async runFullCleanup(): Promise<void> {
    console.log('🚀 Starting full date cleanup process...');

    await this.cleanupInvalidDates();
    await this.cleanupPendingSyncDates();

    console.log('✅ Full date cleanup process completed');
  }
}

// Make available for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).DateCleanupUtility = DateCleanupUtility;
}

export default DateCleanupUtility;
