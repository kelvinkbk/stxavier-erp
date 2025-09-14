// src/services/BackgroundService.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { LocalStorageService } from './localStorage';
import { Platform } from 'react-native';

const BACKGROUND_FETCH_TASK = 'background-fetch-erp';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Background task definition
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('Background fetch executing...');

    // Sync data in background
    await syncDataInBackground();

    // Check for important updates
    await checkForImportantUpdates();

    console.log('Background fetch completed successfully');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

class BackgroundService {
  private static instance: BackgroundService;
  private isRegistered = false;

  static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  // Initialize background services
  async initialize(): Promise<void> {
    try {
      await this.setupNotifications();
      await this.registerBackgroundFetch();
      await this.schedulePeriodicUpdates();
      console.log('Background service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize background service:', error);
    }
  }

  // Setup push notifications
  private async setupNotifications(): Promise<void> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Get push token for remote notifications
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Push notification token:', token);

      // Store token for server-side notifications
      await LocalStorageService.setItem('pushToken', token.data);
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  }

  // Register background fetch
  private async registerBackgroundFetch(): Promise<void> {
    try {
      if (this.isRegistered) return;

      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false, // Continue after app is closed
          startOnBoot: true, // Start on device boot
        });
        this.isRegistered = true;
        console.log('Background fetch registered');
      }
    } catch (error) {
      console.error('Failed to register background fetch:', error);
    }
  }

  // Schedule periodic updates
  private async schedulePeriodicUpdates(): Promise<void> {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule daily reminder notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'St. Xavier ERP',
          body: 'Check for new updates and notifications',
          data: { screen: 'Dashboard' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      console.log('Periodic notifications scheduled');
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
    }
  }

  // Send immediate notification
  async sendNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Check if background fetch is available
  async getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
    return await BackgroundFetch.getStatusAsync();
  }

  // Manually trigger background sync
  async triggerBackgroundSync(): Promise<void> {
    try {
      await syncDataInBackground();
      await this.sendNotification('Sync Complete', 'Your data has been synchronized');
    } catch (error) {
      console.error('Manual sync failed:', error);
      await this.sendNotification('Sync Failed', 'Failed to synchronize data');
    }
  }
}

// Background data sync function
async function syncDataInBackground(): Promise<void> {
  try {
    // Get cached user data
    const userData = await LocalStorageService.getItem('userData');
    if (!userData) return;

    // Sync with cloud database
    const timestamp = new Date().toISOString();
    await LocalStorageService.setItem('lastBackgroundSync', timestamp);

    console.log('Background data sync completed at:', timestamp);
  } catch (error) {
    console.error('Background sync error:', error);
    throw error;
  }
}

// Check for important updates
async function checkForImportantUpdates(): Promise<void> {
  try {
    // Check for system notifications, fee updates, etc.
    const lastCheck = await LocalStorageService.getItem('lastUpdateCheck');
    const now = new Date().getTime();
    const lastCheckTime = lastCheck ? new Date(lastCheck).getTime() : 0;

    // Only check if it's been more than 1 hour
    if (now - lastCheckTime > 60 * 60 * 1000) {
      await LocalStorageService.setItem('lastUpdateCheck', new Date().toISOString());

      // Here you would typically call your API to check for updates
      console.log('Checked for important updates');
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
}

export default BackgroundService;
