import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  updateDoc,
  writeBatch,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { User } from '../types';
import UserLookupService from './UserLookupService';

export interface SyncStatus {
  lastSync: Date;
  pendingChanges: number;
  isOnline: boolean;
  syncInProgress: boolean;
  autoRefreshEnabled: boolean;
  nextRefresh: Date | null;
  lastError: string | null;
  retryCount: number;
}

interface PendingSync {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

class CloudSyncService {
  private static instance: CloudSyncService;
  private syncStatus: SyncStatus = {
    lastSync: new Date(),
    pendingChanges: 0,
    isOnline: true,
    syncInProgress: false,
    autoRefreshEnabled: true,
    nextRefresh: null,
    lastError: null,
    retryCount: 0
  };
  private listeners: Map<string, () => void> = new Map();
  private autoRefreshInterval: NodeJS.Timeout | null = null;
  private autoRefreshIntervalMs: number = 30000; // 30 seconds default
  private onDataUpdateCallbacks: Set<(data: any) => void> = new Set();
  private netInfoUnsubscribe: (() => void) | null = null;
  private pendingSyncQueue: PendingSync[] = [];
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second
  private userLookupService: UserLookupService;

  static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
      CloudSyncService.instance.userLookupService = UserLookupService.getInstance();
      CloudSyncService.instance.initializeNetworkMonitoring();
    }
    return CloudSyncService.instance;
  }

  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      // Initialize network state
      const netInfoState = await NetInfo.fetch();
      this.syncStatus.isOnline = !!netInfoState.isConnected;

      // Subscribe to network changes
      this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
        const wasOnline = this.syncStatus.isOnline;
        this.syncStatus.isOnline = !!state.isConnected;
        
        console.log(`📶 Network status changed: ${this.syncStatus.isOnline ? 'ONLINE' : 'OFFLINE'}`);
        
        // If we came back online, process pending syncs
        if (!wasOnline && this.syncStatus.isOnline) {
          this.processPendingSyncs();
        }
      });
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
      this.syncStatus.isOnline = true; // Assume online if we can't check
    }
  }

  private async processPendingSyncs(): Promise<void> {
    if (!this.syncStatus.isOnline || this.pendingSyncQueue.length === 0) {
      return;
    }

    console.log(`📤 Processing ${this.pendingSyncQueue.length} pending syncs...`);
    
    const batch = writeBatch(db);
    const processedItems: string[] = [];

    for (const pendingSync of this.pendingSyncQueue.slice()) {
      try {
        if (pendingSync.operation === 'create' || pendingSync.operation === 'update') {
          const userRef = doc(db, 'users', pendingSync.data.uid);
          batch.set(userRef, {
            ...pendingSync.data,
            lastUpdated: serverTimestamp(),
            syncVersion: Date.now()
          }, { merge: true });
        } else if (pendingSync.operation === 'delete') {
          const userRef = doc(db, 'users', pendingSync.id);
          batch.delete(userRef);
        }
        
        processedItems.push(pendingSync.id);
      } catch (error) {
        console.error('Error preparing batch sync:', error);
        
        // Increment retry count
        pendingSync.retryCount++;
        if (pendingSync.retryCount >= this.maxRetries) {
          console.error(`❌ Max retries reached for sync ${pendingSync.id}, removing from queue`);
          processedItems.push(pendingSync.id);
        }
      }
    }

    try {
      await batch.commit();
      console.log(`✅ Batch sync completed: ${processedItems.length} items`);
      
      // Remove processed items from queue
      this.pendingSyncQueue = this.pendingSyncQueue.filter(
        item => !processedItems.includes(item.id)
      );
      
      this.syncStatus.pendingChanges = this.pendingSyncQueue.length;
      this.syncStatus.lastError = null;
      this.syncStatus.retryCount = 0;
    } catch (error) {
      console.error('Batch sync failed:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.syncStatus.retryCount++;
      
      // Retry after delay
      setTimeout(() => this.processPendingSyncs(), this.retryDelay * this.syncStatus.retryCount);
    }
  }

  private addToPendingSync(operation: 'create' | 'update' | 'delete', data: any, id?: string): void {
    const pendingSync: PendingSync = {
      id: id || data.uid || Date.now().toString(),
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    // Remove existing entry for same ID to avoid duplicates
    this.pendingSyncQueue = this.pendingSyncQueue.filter(item => item.id !== pendingSync.id);
    this.pendingSyncQueue.push(pendingSync);
    
    this.syncStatus.pendingChanges = this.pendingSyncQueue.length;
    
    // If online, try to process immediately
    if (this.syncStatus.isOnline) {
      setTimeout(() => this.processPendingSyncs(), 100);
    }
  }

  // Sync user data to cloud with improved error handling
  async syncUserToCloud(user: User): Promise<void> {
    try {
      this.syncStatus.syncInProgress = true;
      
      // Check network connectivity
      if (!this.syncStatus.isOnline) {
        console.log('📱 Offline: Adding to pending sync queue');
        this.addToPendingSync('update', user);
        return;
      }
      
      const userRef = doc(db, 'users', user.uid);
      
      // Filter out undefined values for Firestore compatibility
      const cleanUserData = Object.fromEntries(
        Object.entries(user).filter(([_, value]) => value !== undefined)
      );
      
      const userData = {
        ...cleanUserData,
        lastUpdated: serverTimestamp(),
        syncVersion: Date.now()
      };
      
      await setDoc(userRef, userData, { merge: true });
      
      // Also update the user lookup collection for username resolution
      try {
        await this.userLookupService.createUserLookup(user);
      } catch (lookupError) {
        console.warn('⚠️ Failed to update user lookup, continuing with main sync:', lookupError);
      }
      
      // Also sync to local storage
      await AsyncStorage.setItem(`user_${user.uid}`, JSON.stringify(user));
      
      // Remove from pending queue if it was there
      this.pendingSyncQueue = this.pendingSyncQueue.filter(item => item.id !== user.uid);
      this.syncStatus.pendingChanges = this.pendingSyncQueue.length;
      
      console.log('✅ User synced to cloud:', user.email);
      this.syncStatus.lastError = null;
      this.syncStatus.retryCount = 0;
    } catch (error) {
      console.error('❌ Failed to sync user to cloud:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown sync error';
      
      // Add to pending queue for retry
      this.addToPendingSync('update', user);
      throw error;
    } finally {
      this.syncStatus.syncInProgress = false;
      this.syncStatus.lastSync = new Date();
    }
  }

  // Get user from cloud with local fallback and improved error handling
  async getUserFromCloud(uid: string): Promise<User | null> {
    try {
      // Check network connectivity
      if (!this.syncStatus.isOnline) {
        console.log('📱 Offline: Using local data');
        const localData = await AsyncStorage.getItem(`user_${uid}`);
        return localData ? JSON.parse(localData) : null;
      }

      // Try cloud first with timeout
      const userRef = doc(db, 'users', uid);
      const userSnap = await Promise.race([
        getDoc(userRef),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);
      
      if (userSnap.exists()) {
        const cloudUser = userSnap.data() as User;
        
        // Update local storage with cloud data
        await AsyncStorage.setItem(`user_${uid}`, JSON.stringify(cloudUser));
        
        console.log('✅ User retrieved from cloud:', cloudUser.email);
        return cloudUser;
      }
      
      // Fallback to local storage
      const localData = await AsyncStorage.getItem(`user_${uid}`);
      if (localData) {
        const localUser = JSON.parse(localData) as User;
        
        // Try to sync local data to cloud in background
        this.addToPendingSync('update', localUser);
        
        return localUser;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get user from cloud:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      // Fallback to local storage on error
      try {
        const localData = await AsyncStorage.getItem(`user_${uid}`);
        if (localData) {
          console.log('📱 Using local fallback data');
          return JSON.parse(localData);
        }
        return null;
      } catch (localError) {
        console.error('❌ Local fallback also failed:', localError);
        return null;
      }
    }
  }

  // Get all users with cloud sync
  async getAllUsersFromCloud(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const cloudUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        cloudUsers.push(doc.data() as User);
      });
      
      // Update local storage with cloud data
      for (const user of cloudUsers) {
        await AsyncStorage.setItem(`user_${user.uid}`, JSON.stringify(user));
      }
      
      return cloudUsers;
    } catch (error) {
      console.error('Failed to get users from cloud:', error);
      
      // Fallback to local storage
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const userKeys = allKeys.filter(key => key.startsWith('user_'));
        const userPromises = userKeys.map(async (key) => {
          const userData = await AsyncStorage.getItem(key);
          return userData ? JSON.parse(userData) : null;
        });
        const users = await Promise.all(userPromises);
        return users.filter(user => user !== null);
      } catch {
        return [];
      }
    }
  }

  // Get user by email with cloud sync
  async getUserByEmailFromCloud(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const cloudUser = userDoc.data() as User;
        
        // Update local storage
        await AsyncStorage.setItem(`user_${cloudUser.uid}`, JSON.stringify(cloudUser));
        
        return cloudUser;
      }
      
      // Fallback to local search
      const allUsers = await this.getAllUsersFromCloud();
      return allUsers.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Failed to get user by email from cloud:', error);
      
      // Local fallback
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const userKeys = allKeys.filter(key => key.startsWith('user_'));
        
        for (const key of userKeys) {
          const userData = await AsyncStorage.getItem(key);
          if (userData) {
            const user = JSON.parse(userData) as User;
            if (user.email === email) {
              return user;
            }
          }
        }
        return null;
      } catch {
        return null;
      }
    }
  }

  // Get user by username with cloud sync - now uses lookup service for unauthenticated access
  async getUserByUsernameFromCloud(username: string): Promise<User | null> {
    try {
      // First, get the email from the public lookup collection (no auth required)
      const email = await this.userLookupService.getEmailByUsername(username);
      
      if (!email) {
        // Username not found in lookup
        return null;
      }
      
      // Now get the full user data by email (this requires auth, but should work after login)
      return await this.getUserByEmailFromCloud(email);
    } catch (error) {
      console.error('Failed to get user by username from cloud:', error);
      
      // Local fallback
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const userKeys = allKeys.filter(key => key.startsWith('user_'));
        
        for (const key of userKeys) {
          const userData = await AsyncStorage.getItem(key);
          if (userData) {
            const user = JSON.parse(userData) as User;
            if (user.username === username) {
              return user;
            }
          }
        }
        return null;
      } catch {
        return null;
      }
    }
  }

  // Delete user from cloud and local with improved error handling
  async deleteUserFromCloud(uid: string): Promise<void> {
    try {
      if (!this.syncStatus.isOnline) {
        console.log('📱 Offline: Adding delete to pending sync queue');
        this.addToPendingSync('delete', null, uid);
        // Still delete from local storage immediately
        await AsyncStorage.removeItem(`user_${uid}`);
        return;
      }

      // Delete from cloud
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
      
      // Also delete from user lookup collection
      try {
        await this.userLookupService.deleteUserLookup(uid);
      } catch (lookupError) {
        console.warn('⚠️ Failed to delete user lookup, continuing with main deletion:', lookupError);
      }
      
      // Delete from local
      await AsyncStorage.removeItem(`user_${uid}`);
      
      // Remove from pending queue if it was there
      this.pendingSyncQueue = this.pendingSyncQueue.filter(item => item.id !== uid);
      this.syncStatus.pendingChanges = this.pendingSyncQueue.length;
      
      console.log('✅ User deleted from cloud and local:', uid);
    } catch (error) {
      console.error('❌ Failed to delete user from cloud:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown delete error';
      
      // Add to pending queue for retry
      this.addToPendingSync('delete', null, uid);
      throw error;
    }
  }

  // Real-time sync listener with improved error handling and cleanup
  setupRealtimeSync(uid: string, onUserUpdate: (user: User) => void): () => void {
    try {
      const userRef = doc(db, 'users', uid);
      
      const unsubscribe = onSnapshot(userRef, 
        (doc) => {
          if (doc.exists()) {
            const updatedUser = doc.data() as User;
            
            // Update local storage
            AsyncStorage.setItem(`user_${uid}`, JSON.stringify(updatedUser))
              .catch(error => console.error('Failed to update local storage:', error));
            
            // Notify about the update
            onUserUpdate(updatedUser);
            
            console.log('🔄 Real-time user update received:', updatedUser.email);
          }
        }, 
        (error) => {
          console.error('❌ Real-time sync error:', error);
          this.syncStatus.lastError = error.message;
          
          // Try to reconnect after delay
          setTimeout(() => {
            console.log('🔄 Attempting to reconnect real-time sync...');
            this.setupRealtimeSync(uid, onUserUpdate);
          }, 5000);
        }
      );
      
      // Store the unsubscribe function for cleanup
      this.listeners.set(`realtime_${uid}`, unsubscribe);
      
      console.log('📡 Real-time sync established for user:', uid);
      
      return () => {
        unsubscribe();
        this.listeners.delete(`realtime_${uid}`);
        console.log('📡 Real-time sync disconnected for user:', uid);
      };
    } catch (error) {
      console.error('❌ Failed to setup real-time sync:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      // Return a no-op function
      return () => {};
    }
  }

  // Sync all local data to cloud
  async syncAllLocalDataToCloud(): Promise<void> {
    try {
      this.syncStatus.syncInProgress = true;
      
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith('user_'));
      
      let syncCount = 0;
      
      for (const key of userKeys) {
        try {
          const userData = await AsyncStorage.getItem(key);
          if (userData) {
            const user = JSON.parse(userData) as User;
            await this.syncUserToCloud(user);
            syncCount++;
          }
        } catch (error) {
          console.error(`Failed to sync user from key ${key}:`, error);
        }
      }
      
      console.log(`Synced ${syncCount} users to cloud`);
    } catch (error) {
      console.error('Failed to sync all local data to cloud:', error);
      throw error;
    } finally {
      this.syncStatus.syncInProgress = false;
      this.syncStatus.lastSync = new Date();
    }
  }

  // Force refresh from cloud
  async forceRefreshFromCloud(): Promise<void> {
    try {
      this.syncStatus.syncInProgress = true;
      
      // Get all users from cloud
      const cloudUsers = await this.getAllUsersFromCloud();
      
      // Clear local storage
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith('user_'));
      await AsyncStorage.multiRemove(userKeys);
      
      // Save cloud data to local
      for (const user of cloudUsers) {
        await AsyncStorage.setItem(`user_${user.uid}`, JSON.stringify(user));
      }
      
      console.log(`Refreshed ${cloudUsers.length} users from cloud`);
    } catch (error) {
      console.error('Failed to refresh from cloud:', error);
      throw error;
    } finally {
      this.syncStatus.syncInProgress = false;
      this.syncStatus.lastSync = new Date();
    }
  }

  // Check username availability across cloud and local - now uses lookup service
  async isUsernameAvailableInCloud(username: string): Promise<boolean> {
    try {
      return await this.userLookupService.isUsernameAvailable(username);
    } catch (error) {
      console.error('Failed to check username availability:', error);
      return false;
    }
  }

  // Manual sync trigger
  async triggerSync(): Promise<void> {
    try {
      await this.syncAllLocalDataToCloud();
      await this.forceRefreshFromCloud();
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    }
  }

  // Sync user data on login
  async syncUserOnLogin(uid: string): Promise<User | null> {
    try {
      // Get latest data from cloud
      const cloudUser = await this.getUserFromCloud(uid);
      
      if (cloudUser) {
        // Setup real-time sync for this user
        this.setupRealtimeSync(uid, (updatedUser) => {
          console.log('User data updated in real-time:', updatedUser.email);
        });
      }
      
      return cloudUser;
    } catch (error) {
      console.error('Failed to sync user on login:', error);
      return null;
    }
  }

  // Auto-refresh functionality with improved error handling
  startAutoRefresh(intervalMs: number = 30000): void {
    this.autoRefreshIntervalMs = intervalMs;
    this.syncStatus.autoRefreshEnabled = true;
    
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    
    this.autoRefreshInterval = setInterval(async () => {
      if (this.syncStatus.autoRefreshEnabled && !this.syncStatus.syncInProgress && this.syncStatus.isOnline) {
        console.log('🔄 Auto-refresh: Syncing data...');
        try {
          await this.performAutoRefresh();
        } catch (error) {
          console.error('❌ Auto-refresh failed:', error);
          this.syncStatus.lastError = error instanceof Error ? error.message : 'Auto-refresh error';
        }
      } else if (!this.syncStatus.isOnline) {
        console.log('📱 Auto-refresh skipped: Offline');
      }
    }, intervalMs);
    
    this.updateNextRefreshTime();
    console.log(`✅ Auto-refresh enabled: Every ${intervalMs / 1000} seconds`);
  }

  stopAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
    this.syncStatus.autoRefreshEnabled = false;
    this.syncStatus.nextRefresh = null;
    console.log('⏹️ Auto-refresh disabled');
  }

  private async performAutoRefresh(): Promise<void> {
    try {
      this.syncStatus.syncInProgress = true;
      this.updateNextRefreshTime();
      
      // First process any pending syncs
      await this.processPendingSyncs();
      
      // Then refresh all user data from cloud
      const allUsers = await this.getAllUsersFromCloud();
      
      // Notify callbacks about data updates
      this.onDataUpdateCallbacks.forEach(callback => {
        try {
          callback({ 
            users: allUsers, 
            timestamp: new Date(),
            source: 'auto-refresh'
          });
        } catch (error) {
          console.error('❌ Error in auto-refresh callback:', error);
        }
      });
      
      this.syncStatus.lastSync = new Date();
      this.syncStatus.lastError = null;
      console.log(`✅ Auto-refresh completed: ${allUsers.length} users refreshed`);
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Auto-refresh error';
      throw error;
    } finally {
      this.syncStatus.syncInProgress = false;
      this.updateNextRefreshTime();
    }
  }

  private updateNextRefreshTime(): void {
    if (this.syncStatus.autoRefreshEnabled) {
      this.syncStatus.nextRefresh = new Date(Date.now() + this.autoRefreshIntervalMs);
    }
  }

  // Register callback for data updates
  onDataUpdate(callback: (data: any) => void): () => void {
    this.onDataUpdateCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.onDataUpdateCallbacks.delete(callback);
    };
  }

  // Get auto-refresh status
  getAutoRefreshStatus(): { 
    enabled: boolean; 
    interval: number; 
    nextRefresh: Date | null; 
    lastRefresh: Date 
  } {
    return {
      enabled: this.syncStatus.autoRefreshEnabled,
      interval: this.autoRefreshIntervalMs,
      nextRefresh: this.syncStatus.nextRefresh,
      lastRefresh: this.syncStatus.lastSync
    };
  }

  // Set auto-refresh interval
  setAutoRefreshInterval(intervalMs: number): void {
    this.autoRefreshIntervalMs = intervalMs;
    if (this.syncStatus.autoRefreshEnabled) {
      this.startAutoRefresh(intervalMs);
    }
  }

  // Force refresh now
  async forceRefresh(): Promise<void> {
    console.log('🔄 Force refresh triggered...');
    await this.performAutoRefresh();
  }

  // Cleanup listeners with improved cleanup
  cleanup(): void {
    // Unsubscribe from all real-time listeners
    this.listeners.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error during listener cleanup:', error);
      }
    });
    this.listeners.clear();
    
    // Stop auto-refresh
    this.stopAutoRefresh();
    
    // Clear data update callbacks
    this.onDataUpdateCallbacks.clear();
    
    // Unsubscribe from network monitoring
    if (this.netInfoUnsubscribe) {
      try {
        this.netInfoUnsubscribe();
        this.netInfoUnsubscribe = null;
      } catch (error) {
        console.error('Error during network monitoring cleanup:', error);
      }
    }
    
    // Clear pending sync queue
    this.pendingSyncQueue = [];
    this.syncStatus.pendingChanges = 0;
    
    console.log('🧹 CloudSyncService cleanup completed');
  }

  // Get comprehensive sync status
  getSyncStatus(): SyncStatus {
    return { 
      ...this.syncStatus,
      pendingChanges: this.pendingSyncQueue.length
    };
  }

  // Get detailed sync information
  getSyncDetails(): {
    status: SyncStatus;
    pendingQueue: PendingSync[];
    activeListeners: string[];
  } {
    return {
      status: this.getSyncStatus(),
      pendingQueue: [...this.pendingSyncQueue],
      activeListeners: Array.from(this.listeners.keys())
    };
  }

  // Force sync all pending operations
  async forceSyncPending(): Promise<void> {
    if (this.pendingSyncQueue.length === 0) {
      console.log('📭 No pending syncs to process');
      return;
    }

    console.log(`📤 Force syncing ${this.pendingSyncQueue.length} pending operations...`);
    await this.processPendingSyncs();
  }

  // Clear error state
  clearError(): void {
    this.syncStatus.lastError = null;
    this.syncStatus.retryCount = 0;
  }

  // Sync all existing users to lookup collection (migration helper)
  async syncAllUsersToLookup(): Promise<void> {
    try {
      console.log('🔄 Starting migration to user lookup collection...');
      const allUsers = await this.getAllUsersFromCloud();
      await this.userLookupService.syncAllUsersToLookup(allUsers);
      console.log('✅ User lookup migration completed successfully');
    } catch (error) {
      console.error('❌ Failed to sync users to lookup collection:', error);
      throw error;
    }
  }
}

export default CloudSyncService;
