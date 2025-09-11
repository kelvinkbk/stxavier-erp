// src/utils/webDeleteQuickFix.ts
// Quick fix utility to ensure web delete functionality works

import { Platform } from 'react-native';

/**
 * Web-compatible delete confirmation and execution
 */
export const webDeleteQuickFix = {
  
  /**
   * Check if we're running on web
   */
  isWeb: () => Platform.OS === 'web',
  
  /**
   * Web-compatible confirmation dialog
   */
  confirmAction: (message: string): boolean => {
    if (Platform.OS === 'web') {
      return confirm(message);
    }
    return false; // Will use Alert.alert on mobile
  },
  
  /**
   * Web-compatible alert
   */
  showAlert: (title: string, message: string): void => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    }
  },
  
  /**
   * Enhanced logging for web debugging
   */
  log: (category: string, message: string, data?: any): void => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${category}] ${message}`, data || '');
  },
  
  /**
   * Test if delete functionality is available
   */
  testDeleteFunctionality: async (): Promise<boolean> => {
    try {
      // Check if required modules are available
      const { UserDeletionSyncFix } = await import('./fixUserDeletionSync');
      const { LocalStorageService } = await import('../services/localStorage');
      
      webDeleteQuickFix.log('TEST', 'UserDeletionSyncFix loaded successfully');
      webDeleteQuickFix.log('TEST', 'LocalStorageService loaded successfully');
      
      // Test basic functionality
      const deletionLog = await UserDeletionSyncFix.getDeletionLog();
      webDeleteQuickFix.log('TEST', 'Deletion log accessible', deletionLog);
      
      const users = await LocalStorageService.getAllUsers();
      webDeleteQuickFix.log('TEST', 'Users list accessible', { count: users.length });
      
      return true;
    } catch (error) {
      webDeleteQuickFix.log('TEST', 'Delete functionality test failed', error);
      return false;
    }
  }
};

export default webDeleteQuickFix;
