// src/services/debugAuth.ts
import { auth } from '../firebase';
import { LocalStorageService } from './localStorage';

export class DebugAuth {
  static async checkCurrentAuth(): Promise<void> {
    console.log('🔍 === AUTH DEBUG INFO ===');
    
    // Check Firebase auth state
    const currentUser = auth.currentUser;
    console.log('🔥 Firebase User:', currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified
    } : 'Not authenticated');
    
    // Check local storage user data
    if (currentUser) {
      try {
        const userData = await LocalStorageService.getUser(currentUser.uid);
        console.log('👤 Local User Data:', userData);
        
        // Check if user has admin/faculty role
        if (userData) {
          console.log('🎭 User Role:', userData.role);
          console.log('📋 User Department:', userData.department);
          console.log('🔑 Can mark attendance:', ['admin', 'faculty'].includes(userData.role));
        }
      } catch (error) {
        console.error('❌ Error getting local user data:', error);
      }
    }
    
    console.log('🔍 === END AUTH DEBUG ===');
  }
  
  static async createTestAttendance(): Promise<void> {
    console.log('🧪 Testing attendance creation...');
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('❌ No authenticated user');
        return;
      }
      
      const userData = await LocalStorageService.getUser(currentUser.uid);
      if (!userData) {
        console.error('❌ No user data found');
        return;
      }
      
      console.log('✅ Auth test passed - User:', userData.email, 'Role:', userData.role);
      
    } catch (error) {
      console.error('❌ Auth test failed:', error);
    }
  }
}
