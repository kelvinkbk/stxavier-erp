// src/services/AppStatusService.ts
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import BackgroundService from './BackgroundService';
import { LocalStorageService } from './localStorage';

export interface AppStatus {
  isOnline: boolean;
  lastSync: string | null;
  backgroundFetchEnabled: boolean;
  notificationsEnabled: boolean;
  appVersion: string;
  deviceInfo: {
    platform: string;
    isDevice: boolean;
  };
}

class AppStatusService {
  private static instance: AppStatusService;

  static getInstance(): AppStatusService {
    if (!AppStatusService.instance) {
      AppStatusService.instance = new AppStatusService();
    }
    return AppStatusService.instance;
  }

  // Get comprehensive app status
  async getAppStatus(): Promise<AppStatus> {
    const backgroundService = BackgroundService.getInstance();
    const networkState = await Network.getNetworkStateAsync();

    return {
      isOnline: networkState.isConnected ?? false,
      lastSync: await LocalStorageService.getItem('lastBackgroundSync'),
      backgroundFetchEnabled: await this.isBackgroundFetchEnabled(),
      notificationsEnabled: await this.areNotificationsEnabled(),
      appVersion: await this.getAppVersion(),
      deviceInfo: {
        platform: this.getPlatform(),
        isDevice: this.isPhysicalDevice(),
      },
    };
  }

  // Check if background fetch is working
  private async isBackgroundFetchEnabled(): Promise<boolean> {
    try {
      const backgroundService = BackgroundService.getInstance();
      const status = await backgroundService.getBackgroundFetchStatus();
      return status === 1; // Available
    } catch (error) {
      return false;
    }
  }

  // Check if notifications are enabled
  private async areNotificationsEnabled(): Promise<boolean> {
    try {
      if ('Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Get platform information
  private getPlatform(): string {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
    if (/Android/.test(userAgent)) return 'Android';
    return 'Web';
  }

  // Check if running on physical device
  private isPhysicalDevice(): boolean {
    const platform = this.getPlatform();
    return platform === 'iOS' || platform === 'Android';
  }

  // Get app version
  private async getAppVersion(): Promise<string> {
    try {
      return Application.nativeApplicationVersion || '1.0.0';
    } catch (error) {
      console.warn('Could not get app version:', error);
      return '1.0.0';
    }
  }

  // Send status report
  async sendStatusReport(): Promise<void> {
    try {
      const status = await this.getAppStatus();
      console.log('📊 App Status Report:', status);

      // Store status locally
      await LocalStorageService.setItem('lastStatusReport', {
        timestamp: new Date().toISOString(),
        status,
      });

      // Send notification if there are issues
      if (!status.isOnline || !status.backgroundFetchEnabled) {
        const backgroundService = BackgroundService.getInstance();
        await backgroundService.sendNotification(
          'App Status Alert',
          'Some features may not be working optimally'
        );
      }
    } catch (error) {
      console.error('Failed to generate status report:', error);
    }
  }

  // Validate app configuration
  async validateConfiguration(): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const status = await this.getAppStatus();

      if (!status.backgroundFetchEnabled) {
        issues.push('Background sync not available');
      }

      if (!status.notificationsEnabled) {
        issues.push('Push notifications not enabled');
      }

      if (!status.lastSync) {
        issues.push('Initial sync not completed');
      } else {
        const lastSync = new Date(status.lastSync);
        const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
        if (hoursSinceSync > 24) {
          issues.push('Data not synced in 24+ hours');
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: ['Failed to validate configuration'],
      };
    }
  }
}

export default AppStatusService;
