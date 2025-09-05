import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

/**
 * UserLookupService handles the public user lookup collection
 * that allows username-to-email resolution without authentication
 */
class UserLookupService {
  private static instance: UserLookupService;

  static getInstance(): UserLookupService {
    if (!UserLookupService.instance) {
      UserLookupService.instance = new UserLookupService();
    }
    return UserLookupService.instance;
  }

  /**
   * Create or update a user lookup entry
   * This should be called whenever a user is created or their username/email changes
   */
  async createUserLookup(user: User): Promise<void> {
    try {
      const lookupRef = doc(db, 'user_lookup', user.uid);
      await setDoc(lookupRef, {
        uid: user.uid,
        username: user.username,
        email: user.email,
        lastUpdated: new Date()
      });
      
      console.log('✅ User lookup entry created/updated for:', user.username);
    } catch (error) {
      console.error('❌ Failed to create user lookup entry:', error);
      throw error;
    }
  }

  /**
   * Get email by username without authentication
   */
  async getEmailByUsername(username: string): Promise<string | null> {
    try {
      const lookupRef = collection(db, 'user_lookup');
      const q = query(lookupRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const lookupDoc = querySnapshot.docs[0];
        const lookupData = lookupDoc.data();
        return lookupData.email;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get email by username:', error);
      return null;
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const email = await this.getEmailByUsername(username);
      return email === null;
    } catch (error) {
      console.error('❌ Failed to check username availability:', error);
      return false;
    }
  }

  /**
   * Delete user lookup entry when user is deleted
   */
  async deleteUserLookup(uid: string): Promise<void> {
    try {
      const lookupRef = doc(db, 'user_lookup', uid);
      await deleteDoc(lookupRef);
      console.log('✅ User lookup entry deleted for UID:', uid);
    } catch (error) {
      console.error('❌ Failed to delete user lookup entry:', error);
      throw error;
    }
  }

  /**
   * Sync all existing users to the lookup collection
   * This is a one-time migration function
   */
  async syncAllUsersToLookup(users: User[]): Promise<void> {
    try {
      console.log(`🔄 Syncing ${users.length} users to lookup collection...`);
      
      for (const user of users) {
        try {
          await this.createUserLookup(user);
        } catch (error) {
          console.error(`Failed to sync user ${user.username} to lookup:`, error);
        }
      }
      
      console.log('✅ User lookup sync completed');
    } catch (error) {
      console.error('❌ Failed to sync users to lookup collection:', error);
      throw error;
    }
  }
}

export default UserLookupService;
