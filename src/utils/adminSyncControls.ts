// src/utils/adminSyncControls.ts
// Admin utilities to control sync behavior and fix deletion issues

import { UserDeletionSyncFix } from './fixUserDeletionSync';
import CloudSyncService from '../services/CloudSyncService';

export class AdminSyncControls {
  private static cloudSync = CloudSyncService.getInstance();
  
  /**
   * Emergency: Stop auto-refresh to prevent user restoration
   */
  static emergencyStopAutoRestore(): void {
    UserDeletionSyncFix.disableAutoRefresh();
    console.log('🚨 EMERGENCY: Auto-refresh disabled to stop user restoration');
  }
  
  /**
   * Re-enable auto-refresh after fixing issues
   */
  static resumeAutoRefresh(): void {
    UserDeletionSyncFix.enableAutoRefresh();
    console.log('✅ Auto-refresh resumed');
  }
  
  /**
   * Get current sync status for debugging
   */
  static getCurrentSyncStatus() {
    const status = UserDeletionSyncFix.getSyncStatus();
    console.log('📊 Current Sync Status:', {
      autoRefreshEnabled: status.autoRefreshEnabled,
      syncInProgress: status.syncInProgress,
      lastSync: status.lastSync,
      pendingChanges: status.pendingChanges,
      lastError: status.lastError
    });
    return status;
  }
  
  /**
   * View deletion log for debugging
   */
  static async viewDeletionLog() {
    const log = await UserDeletionSyncFix.getDeletionLog();
    console.log('📝 User Deletion Log:', log);
    return log;
  }
  
  /**
   * Quick fix: Delete a user and immediately disable auto-refresh
   */
  static async quickDeleteUser(uid: string): Promise<void> {
    try {
      console.log('🔧 Quick delete user:', uid);
      
      // Disable auto-refresh first
      this.emergencyStopAutoRestore();
      
      // Delete the user
      await UserDeletionSyncFix.deleteUserPermanently(uid);
      
      // Keep auto-refresh disabled for 1 minute to ensure deletion sticks
      setTimeout(() => {
        this.resumeAutoRefresh();
        console.log('⏰ Auto-refresh automatically resumed after 1 minute');
      }, 60000);
      
      console.log('✅ Quick delete completed. Auto-refresh will resume in 1 minute.');
    } catch (error) {
      console.error('❌ Quick delete failed:', error);
      throw error;
    }
  }
  
  /**
   * Clean up old deletion logs
   */
  static async cleanupDeletionLogs(daysOld: number = 30): Promise<void> {
    await UserDeletionSyncFix.cleanOldDeletionLogs(daysOld);
    console.log(`🧹 Cleaned deletion logs older than ${daysOld} days`);
  }
  
  /**
   * Debug: Show detailed sync information
   */
  static async debugSyncIssue(): Promise<{
    syncStatus: any;
    deletionLog: any[];
    recommendations: string[];
  }> {
    const syncStatus = this.getCurrentSyncStatus();
    const deletionLog = await this.viewDeletionLog();
    
    const recommendations: string[] = [];
    
    if (syncStatus.autoRefreshEnabled && deletionLog.length > 0) {
      recommendations.push('⚠️ Auto-refresh is enabled with pending deletions - users may be restored');
    }
    
    if (syncStatus.lastError) {
      recommendations.push(`🔧 Last sync error: ${syncStatus.lastError}`);
    }
    
    if (syncStatus.pendingChanges > 0) {
      recommendations.push(`📤 ${syncStatus.pendingChanges} pending sync operations`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Sync system appears healthy');
    }
    
    const result = {
      syncStatus,
      deletionLog,
      recommendations
    };
    
    console.log('🔍 Sync Debug Report:', result);
    return result;
  }
}

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).AdminSyncControls = AdminSyncControls;
  console.log('🔧 AdminSyncControls available in browser console');
}

export default AdminSyncControls;
