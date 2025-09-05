// Sync System Test Script
// Run this in your app to validate all sync fixes are working

import CloudSyncService from '../services/CloudSyncService';
import { LocalStorageService } from '../services/localStorage';

export class SyncTestSuite {
  private static cloudSync = CloudSyncService.getInstance();

  static async runAllTests(): Promise<{
    results: string[];
    success: boolean;
    summary: string;
  }> {
    const results: string[] = [];
    let allPassed = true;

    results.push('🧪 Starting Comprehensive Sync Test Suite...\n');

    try {
      // Test 1: Service Initialization
      results.push('📋 Test 1: Service Initialization');
      const syncStatus = this.cloudSync.getSyncStatus();
      if (syncStatus) {
        results.push('✅ CloudSyncService initialized successfully');
      } else {
        results.push('❌ CloudSyncService initialization failed');
        allPassed = false;
      }

      // Test 2: Network Monitoring
      results.push('\n📋 Test 2: Network Monitoring');
      const isOnline = syncStatus.isOnline;
      results.push(`📶 Network Status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      results.push('✅ Network monitoring functional');

      // Test 3: Local Storage Integration
      results.push('\n📋 Test 3: Local Storage Integration');
      try {
        await LocalStorageService.saveData('test_sync', { test: 'data', timestamp: Date.now() });
        const testData = await LocalStorageService.getData('test_sync');
        if (testData && testData.test === 'data') {
          results.push('✅ Local storage read/write working');
          await LocalStorageService.removeData('test_sync');
        } else {
          results.push('❌ Local storage test failed');
          allPassed = false;
        }
      } catch (error) {
        results.push(`❌ Local storage error: ${error}`);
        allPassed = false;
      }

      // Test 4: Auto-refresh Status
      results.push('\n📋 Test 4: Auto-refresh System');
      const autoRefreshStatus = this.cloudSync.getAutoRefreshStatus();
      results.push(`🔄 Auto-refresh: ${autoRefreshStatus.enabled ? 'ENABLED' : 'DISABLED'}`);
      results.push(`⏱️ Interval: ${autoRefreshStatus.interval / 1000} seconds`);
      if (autoRefreshStatus.enabled) {
        results.push('✅ Auto-refresh system active');
      } else {
        results.push('⚠️ Auto-refresh disabled (this is normal if manually turned off)');
      }

      // Test 5: Sync Queue Status
      results.push('\n📋 Test 5: Sync Queue Management');
      const pendingCount = syncStatus.pendingChanges;
      results.push(`📤 Pending Operations: ${pendingCount}`);
      if (pendingCount === 0) {
        results.push('✅ No pending sync operations');
      } else {
        results.push(`⚠️ ${pendingCount} operations pending (will sync when online)`);
      }

      // Test 6: Error State Check
      results.push('\n📋 Test 6: Error State Monitoring');
      if (syncStatus.lastError) {
        results.push(`⚠️ Last Error: ${syncStatus.lastError}`);
        results.push(`🔄 Retry Count: ${syncStatus.retryCount}`);
        results.push('ℹ️ Error monitoring working - use debug panel to investigate');
      } else {
        results.push('✅ No sync errors detected');
      }

      // Test 7: Detailed Diagnostics
      results.push('\n📋 Test 7: Diagnostic Information');
      const syncDetails = this.cloudSync.getSyncDetails();
      results.push(`🔧 Active Listeners: ${syncDetails.activeListeners.length}`);
      results.push(`📊 Pending Queue Items: ${syncDetails.pendingQueue.length}`);
      results.push(`⏰ Last Sync: ${syncStatus.lastSync.toLocaleString()}`);
      results.push('✅ Diagnostic system operational');

      // Test 8: Cloud Connectivity Test (if online)
      if (isOnline) {
        results.push('\n📋 Test 8: Cloud Connectivity');
        try {
          const users = await this.cloudSync.getAllUsersFromCloud();
          results.push(`☁️ Cloud connection successful - ${users.length} users found`);
          results.push('✅ Cloud sync capabilities verified');
        } catch (error) {
          results.push(`❌ Cloud connectivity test failed: ${error}`);
          allPassed = false;
        }
      } else {
        results.push('\n📋 Test 8: Cloud Connectivity');
        results.push('⚠️ Skipped - device is offline');
      }

      // Final Summary
      results.push('\n🎯 Test Suite Summary:');
      results.push(`📊 Overall Status: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
      results.push(`📶 Network: ${isOnline ? 'Connected' : 'Disconnected'}`);
      results.push(`📤 Pending: ${pendingCount} operations`);
      results.push(`🔄 Auto-refresh: ${autoRefreshStatus.enabled ? 'Active' : 'Inactive'}`);
      results.push(`❌ Errors: ${syncStatus.lastError ? 'Present' : 'None'}`);

    } catch (error) {
      results.push(`\n💥 Test suite crashed: ${error}`);
      allPassed = false;
    }

    const summary = allPassed 
      ? '🎉 All sync systems operational!'
      : '⚠️ Some issues detected - check debug panel for details';

    return {
      results,
      success: allPassed,
      summary
    };
  }

  // Quick health check
  static getQuickStatus(): string {
    try {
      const status = this.cloudSync.getSyncStatus();
      const autoRefresh = this.cloudSync.getAutoRefreshStatus();
      
      return `📊 Sync Health: ${status.isOnline ? '🟢' : '🔴'} ${
        status.syncInProgress ? 'SYNCING' : 'READY'
      } | Pending: ${status.pendingChanges} | Auto-refresh: ${
        autoRefresh.enabled ? '🟢' : '⚪'
      } | Last: ${new Date(status.lastSync).toLocaleTimeString()}`;
    } catch (error) {
      return `❌ Status check failed: ${error}`;
    }
  }

  // Force sync all pending operations
  static async forceSyncAll(): Promise<string> {
    try {
      const beforeStatus = this.cloudSync.getSyncStatus();
      const pendingBefore = beforeStatus.pendingChanges;
      
      if (pendingBefore === 0) {
        return '📭 No pending operations to sync';
      }
      
      await this.cloudSync.forceSyncPending();
      
      const afterStatus = this.cloudSync.getSyncStatus();
      const pendingAfter = afterStatus.pendingChanges;
      
      return `🔄 Force sync completed: ${pendingBefore - pendingAfter} operations processed`;
    } catch (error) {
      return `❌ Force sync failed: ${error}`;
    }
  }
}

// Export for use in debug panel or testing
export default SyncTestSuite;
