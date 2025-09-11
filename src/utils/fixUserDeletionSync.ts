// src/utils/fixUserDeletionSync.ts
// Fix for automatic user restoration issue

import CloudSyncService from '../services/CloudSyncService';
import { LocalStorageService } from '../services/localStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UserDeletionSyncFix {
  private static cloudSync = CloudSyncService.getInstance();
  
  /**
   * Enhanced user deletion that prevents auto-restoration
   */
  static async deleteUserPermanently(uid: string): Promise<void> {
    try {
      console.log(`🗑️ Permanently deleting user: ${uid}`);
      
      // 1. Stop auto-refresh temporarily to prevent restoration
      const wasAutoRefreshEnabled = this.cloudSync.getSyncStatus().autoRefreshEnabled;
      if (wasAutoRefreshEnabled) {
        this.cloudSync.stopAutoRefresh();
        console.log('⏸️ Auto-refresh temporarily disabled');
      }
      
      // 2. Delete from cloud first (most important)
      await this.cloudSync.deleteUserFromCloud(uid);
      console.log('☁️ User deleted from cloud');
      
      // 3. Delete from local storage
      await AsyncStorage.removeItem(`user_${uid}`);
      console.log('📱 User deleted from local storage');
      
      // 4. Add to deletion tracking to prevent restoration
      await this.addToDeletionLog(uid);
      
      // 5. Wait a moment for cloud deletion to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 6. Re-enable auto-refresh if it was enabled
      if (wasAutoRefreshEnabled) {
        this.cloudSync.startAutoRefresh();
        console.log('▶️ Auto-refresh re-enabled');
      }
      
      console.log(`✅ User ${uid} permanently deleted`);
    } catch (error) {
      console.error('❌ Failed to delete user permanently:', error);
      throw error;
    }
  }
  
  /**
   * Track deleted users to prevent restoration
   */
  private static async addToDeletionLog(uid: string): Promise<void> {
    try {
      const deletionLog = await this.getDeletionLog();
      deletionLog.push({
        uid,
        deletedAt: new Date().toISOString(),
        deletedBy: 'admin' // You can make this dynamic
      });
      
      await AsyncStorage.setItem('user_deletion_log', JSON.stringify(deletionLog));
      console.log(`📝 Added ${uid} to deletion log`);
    } catch (error) {
      console.error('Failed to update deletion log:', error);
    }
  }
  
  /**
   * Get list of deleted users
   */
  static async getDeletionLog(): Promise<Array<{uid: string, deletedAt: string, deletedBy: string}>> {
    try {
      const log = await AsyncStorage.getItem('user_deletion_log');
      return log ? JSON.parse(log) : [];
    } catch {
      return [];
    }
  }
  
  /**
   * Check if a user was intentionally deleted
   */
  static async wasUserDeleted(uid: string): Promise<boolean> {
    const deletionLog = await this.getDeletionLog();
    return deletionLog.some(entry => entry.uid === uid);
  }
  
  /**
   * Clean old deletion logs (optional, for maintenance)
   */
  static async cleanOldDeletionLogs(daysOld: number = 30): Promise<void> {
    try {
      const deletionLog = await this.getDeletionLog();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const cleanedLog = deletionLog.filter(entry => {
        const deletedAt = new Date(entry.deletedAt);
        return deletedAt > cutoffDate;
      });
      
      await AsyncStorage.setItem('user_deletion_log', JSON.stringify(cleanedLog));
      console.log(`🧹 Cleaned deletion log: ${deletionLog.length - cleanedLog.length} old entries removed`);
    } catch (error) {
      console.error('Failed to clean deletion log:', error);
    }
  }
  
  /**
   * Quick fix: Disable auto-refresh temporarily
   */
  static disableAutoRefresh(): void {
    this.cloudSync.stopAutoRefresh();
    console.log('🛑 Auto-refresh disabled to prevent user restoration');
  }
  
  /**
   * Re-enable auto-refresh
   */
  static enableAutoRefresh(): void {
    this.cloudSync.startAutoRefresh();
    console.log('✅ Auto-refresh re-enabled');
  }
  
  /**
   * Get current sync status
   */
  static getSyncStatus() {
    return this.cloudSync.getSyncStatus();
  }
}

export default UserDeletionSyncFix;
