// src/services/AnalyticsService.ts
// Advanced analytics and reporting service

import { User } from '../types';
import { LocalStorageService } from './localStorage';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export interface DashboardMetrics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  usersByRole: {
    admin: number;
    faculty: number;
    student: number;
  };
  systemPerformance: {
    averageLoadTime: number;
    uptime: number;
    errorRate: number;
  };
  recentActivity: ActivityEntry[];
  popularFeatures: FeatureUsage[];
}

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
  details: string;
}

export interface FeatureUsage {
  feature: string;
  usage: number;
  growth: number;
}

export interface UserEngagementMetrics {
  dailyActiveUsers: number[];
  weeklyActiveUsers: number[];
  monthlyActiveUsers: number[];
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
}

export interface AcademicMetrics {
  totalStudents: number;
  totalFaculty: number;
  attendanceRate: number;
  gradingCompletion: number;
  libraryUsage: number;
  noticeEngagement: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private activityLog: ActivityEntry[] = [];
  private featureUsage: Map<string, number> = new Map();
  private performanceMonitor: PerformanceMonitor;

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.loadActivityLog();
    this.loadFeatureUsage();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track user activity
  async trackActivity(userId: string, action: string, details: string = ''): Promise<void> {
    try {
      const user = await LocalStorageService.getUser(userId);
      if (!user) return;

      const activity: ActivityEntry = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userName: user.name,
        action,
        timestamp: new Date(),
        details,
      };

      this.activityLog.unshift(activity);

      // Keep only last 1000 activities
      if (this.activityLog.length > 1000) {
        this.activityLog = this.activityLog.slice(0, 1000);
      }

      await this.saveActivityLog();
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }

  // Track feature usage
  trackFeatureUsage(feature: string): void {
    const currentUsage = this.featureUsage.get(feature) || 0;
    this.featureUsage.set(feature, currentUsage + 1);
    this.saveFeatureUsage();
  }

  // Get comprehensive dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const allUsers = await LocalStorageService.getAllUsers();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // User statistics
      const usersByRole = allUsers.reduce(
        (acc, user) => {
          acc[user.role as keyof typeof acc] = (acc[user.role as keyof typeof acc] || 0) + 1;
          return acc;
        },
        { admin: 0, faculty: 0, student: 0 }
      );

      // Active users (mock data - in real app, track login activity)
      const activeUsersToday = Math.floor(allUsers.length * 0.3);
      const activeUsersThisWeek = Math.floor(allUsers.length * 0.7);

      // Performance metrics
      const performanceMetrics = {
        averageLoadTime: 1.2,
        uptime: 99.9,
        errorRate: 0.1,
      };

      // Recent activity
      const recentActivity = this.activityLog.slice(0, 10);

      // Popular features
      const popularFeatures = Array.from(this.featureUsage.entries())
        .map(([feature, usage]) => ({
          feature,
          usage,
          growth: Math.random() * 20 - 10, // Mock growth data
        }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 5);

      return {
        totalUsers: allUsers.length,
        activeUsersToday,
        activeUsersThisWeek,
        usersByRole,
        systemPerformance: {
          averageLoadTime: performanceMetrics.averageLoadTime,
          uptime: performanceMetrics.uptime,
          errorRate: performanceMetrics.errorRate,
        },
        recentActivity,
        popularFeatures,
      };
    } catch (error) {
      console.error('Failed to get dashboard metrics:', error);
      throw error;
    }
  }

  // Get user engagement metrics
  async getUserEngagementMetrics(): Promise<UserEngagementMetrics> {
    // Mock data - in real app, track actual user engagement
    return {
      dailyActiveUsers: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
      weeklyActiveUsers: Array.from({ length: 12 }, () => Math.floor(Math.random() * 300)),
      monthlyActiveUsers: Array.from({ length: 12 }, () => Math.floor(Math.random() * 800)),
      sessionDuration: 15.5, // minutes
      pageViews: 1250,
      bounceRate: 25.3, // percentage
    };
  }

  // Get academic metrics
  async getAcademicMetrics(): Promise<AcademicMetrics> {
    const allUsers = await LocalStorageService.getAllUsers();
    const students = allUsers.filter(u => u.role === 'student');
    const faculty = allUsers.filter(u => u.role === 'faculty');

    return {
      totalStudents: students.length,
      totalFaculty: faculty.length,
      attendanceRate: 85.2, // Mock data
      gradingCompletion: 78.5,
      libraryUsage: 1240,
      noticeEngagement: 92.1,
    };
  }

  // Get activity history
  getActivityHistory(limit: number = 50): ActivityEntry[] {
    return this.activityLog.slice(0, limit);
  }

  // Get feature usage statistics
  getFeatureUsageStats(): FeatureUsage[] {
    return Array.from(this.featureUsage.entries()).map(([feature, usage]) => ({
      feature,
      usage,
      growth: Math.random() * 20 - 10, // Mock growth
    }));
  }

  // Export analytics data
  async exportAnalyticsData(): Promise<string> {
    const metrics = await this.getDashboardMetrics();
    const engagementMetrics = await this.getUserEngagementMetrics();
    const academicMetrics = await this.getAcademicMetrics();

    const exportData = {
      timestamp: new Date().toISOString(),
      dashboardMetrics: metrics,
      userEngagement: engagementMetrics,
      academicMetrics: academicMetrics,
      activityLog: this.activityLog,
      featureUsage: Object.fromEntries(this.featureUsage),
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Private methods
  private async loadActivityLog(): Promise<void> {
    try {
      const stored = localStorage.getItem('erp_activity_log');
      if (stored) {
        this.activityLog = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load activity log:', error);
    }
  }

  private async saveActivityLog(): Promise<void> {
    try {
      localStorage.setItem('erp_activity_log', JSON.stringify(this.activityLog));
    } catch (error) {
      console.error('Failed to save activity log:', error);
    }
  }

  private loadFeatureUsage(): void {
    try {
      const stored = localStorage.getItem('erp_feature_usage');
      if (stored) {
        this.featureUsage = new Map(Object.entries(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load feature usage:', error);
    }
  }

  private saveFeatureUsage(): void {
    try {
      localStorage.setItem(
        'erp_feature_usage',
        JSON.stringify(Object.fromEntries(this.featureUsage))
      );
    } catch (error) {
      console.error('Failed to save feature usage:', error);
    }
  }
}

export default AnalyticsService;
