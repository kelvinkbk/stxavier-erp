// src/utils/quickFixSyncErrors.ts
// Quick fix for sync errors in St. Xavier ERP

import CloudSyncService from '../services/CloudSyncService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SyncErrorFix {
  /**
   * Clean up corrupted sync queue data
   */
  static async cleanSyncQueue(): Promise<void> {
    try {
      console.log('🔧 Cleaning sync queue...');
      
      const cloudSync = CloudSyncService.getInstance();
      const status = cloudSync.getSyncStatus();
      
      // Stop auto-refresh temporarily
      cloudSync.stopAutoRefresh();
      
      // Clear any corrupted data
      await AsyncStorage.removeItem('sync_queue');
      await AsyncStorage.removeItem('pending_syncs');
      
      // Reset sync status
      status.pendingChanges = 0;
      status.lastError = null;
      status.retryCount = 0;
      
      console.log('✅ Sync queue cleaned');
      
      // Restart auto-refresh
      cloudSync.startAutoRefresh();
      
      console.log('✅ Auto-refresh restarted');
    } catch (error) {
      console.error('❌ Failed to clean sync queue:', error);
    }
  }
  
  /**
   * Fix indexOf errors by validating data types
   */
  static async validateSyncData(): Promise<void> {
    try {
      console.log('🔍 Validating sync data...');
      
      // Check all stored user data
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.startsWith('user_'));
      
      for (const key of userKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            
            // Validate required fields
            if (!parsed.uid || !parsed.email || !parsed.name) {
              console.warn(`⚠️ Invalid user data in ${key}, removing...`);
              await AsyncStorage.removeItem(key);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Corrupted data in ${key}, removing...`);
          await AsyncStorage.removeItem(key);
        }
      }
      
      console.log('✅ Sync data validation completed');
    } catch (error) {
      console.error('❌ Failed to validate sync data:', error);
    }
  }
  
  /**
   * Emergency sync reset
   */
  static async emergencyReset(): Promise<void> {
    try {
      console.log('🚨 Emergency sync reset...');
      
      await this.cleanSyncQueue();
      await this.validateSyncData();
      
      // Force a fresh sync
      const cloudSync = CloudSyncService.getInstance();
      await cloudSync.triggerSync();
      
      console.log('✅ Emergency reset completed');
    } catch (error) {
      console.error('❌ Emergency reset failed:', error);
    }
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).SyncErrorFix = SyncErrorFix;
  console.log('🔧 SyncErrorFix available in browser console');
}

export default SyncErrorFix;
