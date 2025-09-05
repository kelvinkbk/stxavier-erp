// Enhanced Advanced User Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { LocalStorageService } from './localStorage';

export interface UserFilter {
  role?: string;
  status?: 'active' | 'inactive';
  searchTerm?: string;
  department?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details?: any;
  ipAddress?: string;
}

export interface BulkUserData {
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'faculty' | 'student';
  department?: string;
  regNo?: string;
  phone?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  usersByDepartment: Record<string, number>;
  recentActivity: number;
  newUsersThisMonth: number;
}

export class AdvancedUserService extends LocalStorageService {
  // Advanced user search and filtering
  static async searchUsersAdvanced(filter: UserFilter): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      
      return allUsers.filter(user => {
        // Role filter
        if (filter.role && user.role !== filter.role) {
          return false;
        }
        
        // Department filter
        if (filter.department && user.department !== filter.department) {
          return false;
        }
        
        // Search term filter
        if (filter.searchTerm) {
          const searchTerm = filter.searchTerm.toLowerCase();
          const searchFields = [
            user.name,
            user.email,
            user.username,
            user.phone,
            user.department,
            user.regNo
          ].filter(field => field).join(' ').toLowerCase();
          
          if (!searchFields.includes(searchTerm)) {
            return false;
          }
        }
        
        // Date range filter
        if (filter.dateFrom && user.createdAt < filter.dateFrom) {
          return false;
        }
        
        if (filter.dateTo && user.createdAt > filter.dateTo) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Enhanced bulk import with better validation
  static async importUsersFromCSVAdvanced(csvData: string): Promise<{ 
    success: number; 
    failed: number;
    errors: Array<{ row: number; error: string; data: any }> 
  }> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const errors: Array<{ row: number; error: string; data: any }> = [];
    let success = 0;
    let failed = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < 4) {
        failed++;
        errors.push({
          row: i + 1,
          error: 'Insufficient data columns',
          data: values
        });
        continue;
      }

      try {
        const userData: BulkUserData = {
          name: values[headers.indexOf('name')] || values[0],
          email: values[headers.indexOf('email')] || values[1],
          username: values[headers.indexOf('username')] || values[2],
          role: (values[headers.indexOf('role')] || values[3]) as 'admin' | 'faculty' | 'student',
          department: values[headers.indexOf('department')] || values[4] || undefined,
          regNo: values[headers.indexOf('regno') || headers.indexOf('registration')] || values[5] || undefined,
          phone: values[headers.indexOf('phone')] || values[6] || undefined
        };
        
        // Enhanced validation
        const validation = await this.validateUserDataAdvanced(userData, i + 1);
        if (!validation.isValid) {
          failed++;
          errors.push({
            row: i + 1,
            error: validation.errors.join(', '),
            data: userData
          });
          continue;
        }

        // Create user
        const uid = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const user: User = {
          uid,
          name: userData.name,
          email: userData.email,
          username: userData.username,
          role: userData.role,
          department: userData.department,
          regNo: userData.regNo,
          phone: userData.phone,
          createdAt: new Date(),
        };

        await this.saveUser(uid, user);
        
        // Log activity
        await this.logUserActivity({
          id: `import_${Date.now()}_${i}`,
          userId: uid,
          action: 'USER_IMPORTED',
          timestamp: new Date(),
          details: { importedBy: 'admin', row: i + 1 }
        });

        success++;
      } catch (error) {
        failed++;
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: values
        });
      }
    }

    return { success, failed, errors };
  }

  // Enhanced validation
  private static async validateUserDataAdvanced(
    userData: BulkUserData, 
    row: number
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check required fields
    if (!userData.name) errors.push('Name is required');
    if (!userData.email) errors.push('Email is required');
    if (!userData.username) errors.push('Username is required');
    if (!userData.role) errors.push('Role is required');

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userData.email && !emailRegex.test(userData.email)) {
      errors.push('Invalid email format');
    }

    // Username format validation
    if (userData.username && userData.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    // Role validation
    if (userData.role && !['admin', 'faculty', 'student'].includes(userData.role)) {
      errors.push('Role must be admin, faculty, or student');
    }

    // Check for existing users
    if (userData.email) {
      const existingEmail = await this.getUserByEmail(userData.email);
      if (existingEmail) {
        errors.push('Email already exists');
      }
    }

    if (userData.username) {
      const existingUsername = await this.getUserByUsername(userData.username);
      if (existingUsername) {
        errors.push('Username already exists');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Activity logging
  static async logUserActivity(activity: UserActivity): Promise<void> {
    try {
      const existingActivities = await AsyncStorage.getItem('user_activities');
      const activities: UserActivity[] = existingActivities ? JSON.parse(existingActivities) : [];
      
      activities.push(activity);
      
      // Keep only last 2000 activities
      if (activities.length > 2000) {
        activities.splice(0, activities.length - 2000);
      }
      
      await AsyncStorage.setItem('user_activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  }

  // Get user activities
  static async getUserActivities(userId?: string, limit: number = 50): Promise<UserActivity[]> {
    try {
      const activitiesData = await AsyncStorage.getItem('user_activities');
      if (!activitiesData) return [];
      
      const activities: UserActivity[] = JSON.parse(activitiesData);
      
      const filteredActivities = userId 
        ? activities.filter(activity => activity.userId === userId)
        : activities;
      
      return filteredActivities.slice(-limit).reverse();
    } catch (error) {
      console.error('Failed to get user activities:', error);
      return [];
    }
  }

  // Enhanced user statistics
  static async getUserStatsAdvanced(): Promise<UserStats> {
    try {
      const users = await this.getAllUsers();
      const activities = await this.getUserActivities(undefined, 1000);
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats: UserStats = {
        totalUsers: users.length,
        activeUsers: users.length, // In real app, check recent activity
        usersByRole: {},
        usersByDepartment: {},
        recentActivity: activities.filter(activity => 
          new Date(activity.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        newUsersThisMonth: users.filter(user => 
          user.createdAt > thisMonth
        ).length
      };

      // Count by role
      users.forEach(user => {
        stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
        if (user.department) {
          stats.usersByDepartment[user.department] = (stats.usersByDepartment[user.department] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        usersByRole: {},
        usersByDepartment: {},
        recentActivity: 0,
        newUsersThisMonth: 0
      };
    }
  }

  // Bulk operations
  static async bulkUpdateUsers(
    userIds: string[], 
    updates: Partial<User>
  ): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ userId: string; error: string }>;
  }> {
    const result = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ userId: string; error: string }>
    };

    for (const userId of userIds) {
      try {
        const user = await this.getUser(userId);
        if (!user) {
          result.errors.push({
            userId,
            error: 'User not found'
          });
          result.failed++;
          continue;
        }

        const updatedUser = { ...user, ...updates };
        await this.saveUser(userId, updatedUser);
        
        await this.logUserActivity({
          id: `bulk_update_${Date.now()}_${userId}`,
          userId,
          action: 'USER_BULK_UPDATED',
          timestamp: new Date(),
          details: { updates }
        });

        result.successful++;
      } catch (error) {
        result.errors.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.failed++;
      }
    }

    return result;
  }

  // Enhanced export with filtering
  static async exportUsersAdvanced(filter?: UserFilter): Promise<{
    csv: string;
    json: string;
  }> {
    try {
      const users = filter ? await this.searchUsersAdvanced(filter) : await this.getAllUsers();
      
      // CSV export
      const headers = ['UID', 'Name', 'Email', 'Username', 'Role', 'Department', 'Reg No', 'Phone', 'Created At'];
      const csvRows = [headers.join(',')];
      
      users.forEach(user => {
        const row = [
          user.uid,
          user.name,
          user.email,
          user.username,
          user.role,
          user.department || '',
          user.regNo || '',
          user.phone || '',
          user.createdAt.toISOString()
        ];
        csvRows.push(row.map(field => `"${field}"`).join(','));
      });
      
      const csv = csvRows.join('\n');
      
      // JSON export
      const exportData = {
        exportDate: new Date().toISOString(),
        totalUsers: users.length,
        filter: filter || null,
        users: users
      };
      
      const json = JSON.stringify(exportData, null, 2);
      
      return { csv, json };
    } catch (error) {
      console.error('Error exporting users:', error);
      return { csv: '', json: '{}' };
    }
  }

  // Data cleanup and maintenance
  static async cleanupOldData(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      // Clean old activities
      const activitiesData = await AsyncStorage.getItem('user_activities');
      if (activitiesData) {
        const activities: UserActivity[] = JSON.parse(activitiesData);
        const filteredActivities = activities.filter(
          activity => new Date(activity.timestamp) > cutoffDate
        );
        await AsyncStorage.setItem('user_activities', JSON.stringify(filteredActivities));
      }
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }
}
