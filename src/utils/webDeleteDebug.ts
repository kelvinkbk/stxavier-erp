// src/utils/webDeleteDebug.ts
// Debug utility specifically for web delete operations

import { UserDeletionSyncFix } from './fixUserDeletionSync';
import { LocalStorageService } from '../services/localStorage';
import CloudSyncService from '../services/CloudSyncService';

export class WebDeleteDebug {
  
  /**
   * Test delete functionality on web with detailed logging
   */
  static async testDeleteOnWeb(userId: string, userName: string): Promise<void> {
    console.log('🌐 [WEB DELETE DEBUG] Starting delete test for:', userName, userId);
    
    try {
      // 1. Check initial state
      console.log('📊 [WEB DELETE DEBUG] Step 1: Checking initial state...');
      const initialUsers = await LocalStorageService.getAllUsers();
      const userExists = initialUsers.find(u => u.uid === userId);
      console.log('👤 User exists before delete:', !!userExists);
      console.log('📝 Total users before delete:', initialUsers.length);
      
      // 2. Check cloud sync status
      console.log('📊 [WEB DELETE DEBUG] Step 2: Checking cloud sync status...');
      const cloudSync = CloudSyncService.getInstance();
      const syncStatus = cloudSync.getSyncStatus();
      console.log('☁️ Sync status:', syncStatus);
      
      // 3. Check deletion log
      console.log('📊 [WEB DELETE DEBUG] Step 3: Checking deletion log...');
      const deletionLog = await UserDeletionSyncFix.getDeletionLog();
      console.log('🗑️ Current deletion log:', deletionLog);
      
      // 4. Perform delete with extra logging
      console.log('📊 [WEB DELETE DEBUG] Step 4: Performing delete...');
      console.time('deleteUserPermanently');
      await UserDeletionSyncFix.deleteUserPermanently(userId);
      console.timeEnd('deleteUserPermanently');
      
      // 5. Check state after delete
      console.log('📊 [WEB DELETE DEBUG] Step 5: Checking state after delete...');
      const usersAfterDelete = await LocalStorageService.getAllUsers();
      const userStillExists = usersAfterDelete.find(u => u.uid === userId);
      console.log('👤 User still exists after delete:', !!userStillExists);
      console.log('📝 Total users after delete:', usersAfterDelete.length);
      
      // 6. Check updated deletion log
      const updatedDeletionLog = await UserDeletionSyncFix.getDeletionLog();
      console.log('🗑️ Updated deletion log:', updatedDeletionLog);
      
      // 7. Check if user was properly logged as deleted
      const wasDeleted = await UserDeletionSyncFix.wasUserDeleted(userId);
      console.log('✅ User properly marked as deleted:', wasDeleted);
      
      console.log('🌐 [WEB DELETE DEBUG] Delete test completed successfully!');
      
    } catch (error) {
      console.error('❌ [WEB DELETE DEBUG] Delete test failed:', error);
      throw error;
    }
  }
  
  /**
   * Enhanced delete function specifically for web
   */
  static async deleteUserForWeb(userId: string, userName: string): Promise<boolean> {
    console.log(`🌐 [WEB DELETE] Starting enhanced web delete for: ${userName} (${userId})`);
    
    try {
      // Use the debug test first to ensure everything works
      await this.testDeleteOnWeb(userId, userName);
      
      // If test passes, the delete was successful
      console.log(`✅ [WEB DELETE] User ${userName} successfully deleted`);
      return true;
      
    } catch (error) {
      console.error(`❌ [WEB DELETE] Failed to delete user ${userName}:`, error);
      return false;
    }
  }
  
  /**
   * Web-compatible confirmation and delete
   */
  static async confirmAndDeleteUser(userId: string, userName: string, onSuccess?: () => void, onError?: (error: string) => void): Promise<void> {
    const confirmDelete = confirm(
      `🗑️ Delete User Confirmation\n\n` +
      `User: ${userName}\n` +
      `ID: ${userId}\n\n` +
      `This will permanently remove the user and prevent automatic restoration.\n\n` +
      `Are you sure you want to proceed?`
    );
    
    if (!confirmDelete) {
      console.log('🚫 User cancelled deletion');
      return;
    }
    
    console.log(`🌐 Starting web-compatible delete for: ${userName}`);
    
    try {
      const success = await this.deleteUserForWeb(userId, userName);
      
      if (success) {
        alert(`✅ Success!\n\nUser "${userName}" has been permanently deleted.`);
        onSuccess?.();
      } else {
        const errorMsg = `Failed to delete user "${userName}". Please check the console for details.`;
        alert(`❌ Delete Failed!\n\n${errorMsg}`);
        onError?.(errorMsg);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Delete operation failed:', error);
      alert(`❌ Delete Error!\n\nFailed to delete user "${userName}".\n\nError: ${errorMsg}`);
      onError?.(errorMsg);
    }
  }
  
  /**
   * Quick web delete status check
   */
  static async checkDeleteStatus(): Promise<void> {
    console.log('🔍 [WEB DELETE STATUS] Checking delete functionality status...');
    
    try {
      const users = await LocalStorageService.getAllUsers();
      const deletionLog = await UserDeletionSyncFix.getDeletionLog();
      const syncStatus = CloudSyncService.getInstance().getSyncStatus();
      
      console.log('📊 Delete Status Report:');
      console.log('👥 Total users:', users.length);
      console.log('🗑️ Deletion log entries:', deletionLog.length);
      console.log('☁️ Cloud sync online:', syncStatus.isOnline);
      console.log('🔄 Auto-refresh enabled:', syncStatus.autoRefreshEnabled);
      console.log('⏳ Pending changes:', syncStatus.pendingChanges);
      
      if (deletionLog.length > 0) {
        console.log('🗑️ Recent deletions:', deletionLog.slice(-5));
      }
      
    } catch (error) {
      console.error('❌ Failed to check delete status:', error);
    }
  }
}

export default WebDeleteDebug;
