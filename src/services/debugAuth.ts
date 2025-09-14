// src/services/debugAuth.ts
// Debug utilities for authentication system

import { auth } from '../firebase';
import { User } from '../types';
import { LocalStorageService } from './localStorage';

export class DebugAuth {
  static async checkAuthState(): Promise<{
    hasUsers: boolean;
    userCount: number;
    adminExists: boolean;
    currentUser: User | null;
  }> {
    try {
      const users = await LocalStorageService.getAllUsers();
      const adminUser = users.find(u => u.role === 'admin');

      // Get current user from Firebase auth
      let currentUser: User | null = null;
      if (auth.currentUser) {
        currentUser = await LocalStorageService.getUser(auth.currentUser.uid);
      }

      return {
        hasUsers: users.length > 0,
        userCount: users.length,
        adminExists: !!adminUser,
        currentUser,
      };
    } catch (error) {
      console.error('Debug auth check failed:', error);
      return {
        hasUsers: false,
        userCount: 0,
        adminExists: false,
        currentUser: null,
      };
    }
  }

  static async createDebugAdmin(): Promise<boolean> {
    try {
      const debugAdmin: User = {
        uid: 'debug_admin_' + Date.now(),
        name: 'Debug Admin',
        email: 'admin@debug.test',
        username: 'admin',
        role: 'admin',
        createdAt: new Date(),
      };

      await LocalStorageService.saveUser(debugAdmin.uid, debugAdmin);
      console.log('✅ Debug admin created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create debug admin:', error);
      return false;
    }
  }

  static logAuthInfo(): void {
    this.checkAuthState().then(state => {
      console.log('🔍 Authentication Debug Info:');
      console.log('  - Has Users:', state.hasUsers);
      console.log('  - User Count:', state.userCount);
      console.log('  - Admin Exists:', state.adminExists);
      console.log('  - Current User:', state.currentUser?.name || 'None');
    });
  }
}

export default DebugAuth;
