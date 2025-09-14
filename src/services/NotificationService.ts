// src/services/NotificationService.ts
// Advanced notification system with real-time push notifications

import { User } from '../types';
import { LocalStorageService } from './localStorage';
import AnalyticsService from './AnalyticsService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetRole?: 'admin' | 'faculty' | 'student' | 'all';
  targetUsers?: string[]; // Specific user IDs
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
  createdBy: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    announcements: boolean;
    reminders: boolean;
    grades: boolean;
    attendance: boolean;
    fees: boolean;
    library: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private preferences: Map<string, NotificationPreferences> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private analyticsService: AnalyticsService;

  private constructor() {
    this.analyticsService = AnalyticsService.getInstance();
    this.loadNotifications();
    this.loadPreferences();
    this.startNotificationProcessor();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create and send notification
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ): Promise<string> {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      isRead: false,
    };

    // Add to notifications array
    this.notifications.unshift(newNotification);

    // Limit to 1000 notifications
    if (this.notifications.length > 1000) {
      this.notifications = this.notifications.slice(0, 1000);
    }

    await this.saveNotifications();

    // Track analytics
    this.analyticsService.trackActivity(
      notification.createdBy,
      'create_notification',
      notification.title
    );

    // Notify listeners
    this.notifyListeners();

    // Process immediate notifications
    if (!notification.scheduledFor || notification.scheduledFor <= new Date()) {
      await this.processNotification(newNotification);
    }

    return id;
  }

  // Get notifications for specific user
  async getNotificationsForUser(userId: string, limit: number = 50): Promise<Notification[]> {
    const user = await LocalStorageService.getUser(userId);
    if (!user) return [];

    return this.notifications
      .filter(notification => this.isNotificationForUser(notification, user))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Get unread count for user
  async getUnreadCount(userId: string): Promise<number> {
    const user = await LocalStorageService.getUser(userId);
    if (!user) return 0;

    return this.notifications.filter(
      notification => this.isNotificationForUser(notification, user) && !notification.isRead
    ).length;
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      await this.saveNotifications();
      this.notifyListeners();

      // Track analytics
      this.analyticsService.trackActivity(userId, 'read_notification', notification.title);
    }
  }

  // Mark all as read for user
  async markAllAsRead(userId: string): Promise<void> {
    const user = await LocalStorageService.getUser(userId);
    if (!user) return;

    this.notifications
      .filter(notification => this.isNotificationForUser(notification, user))
      .forEach(notification => (notification.isRead = true));

    await this.saveNotifications();
    this.notifyListeners();

    // Track analytics
    this.analyticsService.trackActivity(userId, 'mark_all_read', 'All notifications');
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Get user preferences
  getUserPreferences(userId: string): NotificationPreferences {
    return this.preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  // Update user preferences
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const current = this.getUserPreferences(userId);
    const updated = { ...current, ...preferences };

    this.preferences.set(userId, updated);
    await this.savePreferences();

    // Track analytics
    this.analyticsService.trackActivity(
      userId,
      'update_notification_preferences',
      'Notification settings'
    );
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Send system announcement
  async sendAnnouncement(
    title: string,
    message: string,
    targetRole: 'all' | 'admin' | 'faculty' | 'student' = 'all',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    createdBy: string
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      type: 'announcement',
      priority,
      targetRole,
      createdBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  // Send reminder notification
  async sendReminder(
    title: string,
    message: string,
    targetUsers: string[],
    scheduledFor: Date,
    createdBy: string
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      type: 'reminder',
      priority: 'medium',
      targetUsers,
      scheduledFor,
      createdBy,
    });
  }

  // Send grade notification
  async sendGradeNotification(
    studentId: string,
    subject: string,
    grade: string,
    createdBy: string
  ): Promise<string> {
    return this.createNotification({
      title: 'New Grade Available',
      message: `Your grade for ${subject} is now available: ${grade}`,
      type: 'info',
      priority: 'medium',
      targetUsers: [studentId],
      createdBy,
      actionUrl: '/student/grades',
      actionText: 'View Grades',
    });
  }

  // Send attendance alert
  async sendAttendanceAlert(
    studentId: string,
    attendancePercentage: number,
    createdBy: string
  ): Promise<string> {
    const type = attendancePercentage < 75 ? 'warning' : 'info';
    const priority = attendancePercentage < 75 ? 'high' : 'medium';

    return this.createNotification({
      title: 'Attendance Update',
      message: `Your attendance is ${attendancePercentage}%. ${
        attendancePercentage < 75 ? 'Please improve your attendance.' : 'Keep it up!'
      }`,
      type,
      priority,
      targetUsers: [studentId],
      createdBy,
      actionUrl: '/student/attendance',
      actionText: 'View Attendance',
    });
  }

  // Private methods
  private isNotificationForUser(notification: Notification, user: User): boolean {
    // Check if notification has expired
    if (notification.expiresAt && notification.expiresAt < new Date()) {
      return false;
    }

    // Check specific user targeting
    if (notification.targetUsers && notification.targetUsers.length > 0) {
      return notification.targetUsers.includes(user.uid);
    }

    // Check role targeting
    if (notification.targetRole && notification.targetRole !== 'all') {
      return notification.targetRole === user.role;
    }

    // Default: show to all users
    return true;
  }

  private async processNotification(notification: Notification): Promise<void> {
    // In a real app, this would handle push notifications, emails, etc.
    console.log(`Processing notification: ${notification.title}`);

    // For web notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
          tag: notification.id,
        });
      }
    }
  }

  private startNotificationProcessor(): void {
    // Check for scheduled notifications every minute
    setInterval(() => {
      const now = new Date();
      const scheduledNotifications = this.notifications.filter(
        n => n.scheduledFor && n.scheduledFor <= now && !n.isRead
      );

      scheduledNotifications.forEach(notification => {
        this.processNotification(notification);
      });
    }, 60000);

    // Clean up expired notifications daily
    setInterval(() => {
      const now = new Date();
      const initialLength = this.notifications.length;

      this.notifications = this.notifications.filter(n => !n.expiresAt || n.expiresAt > now);

      if (this.notifications.length !== initialLength) {
        this.saveNotifications();
        this.notifyListeners();
      }
    }, 24 * 60 * 60 * 1000);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      notificationTypes: {
        announcements: true,
        reminders: true,
        grades: true,
        attendance: true,
        fees: true,
        library: true,
        system: true,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
      },
    };
  }

  private async loadNotifications(): Promise<void> {
    try {
      const stored = localStorage.getItem('erp_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          scheduledFor: n.scheduledFor ? new Date(n.scheduledFor) : undefined,
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  private async saveNotifications(): Promise<void> {
    try {
      localStorage.setItem('erp_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('erp_notification_preferences');
      if (stored) {
        const data = JSON.parse(stored);
        this.preferences = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      const data = Object.fromEntries(this.preferences);
      localStorage.setItem('erp_notification_preferences', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }
}

export default NotificationService;
