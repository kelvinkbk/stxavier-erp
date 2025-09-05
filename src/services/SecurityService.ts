import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  event: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
}

class SecurityService {
  private static instance: SecurityService;
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private maxAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Password validation
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting for login attempts
  async recordLoginAttempt(email: string, success: boolean, ipAddress?: string): Promise<void> {
    const attempts = this.loginAttempts.get(email) || [];
    const now = new Date();
    
    // Remove old attempts (older than lockout duration)
    const recentAttempts = attempts.filter(
      attempt => now.getTime() - attempt.timestamp.getTime() < this.lockoutDuration
    );
    
    recentAttempts.push({
      email,
      timestamp: now,
      success,
      ipAddress
    });
    
    this.loginAttempts.set(email, recentAttempts);
    
    // Log security event
    await this.logSecurityEvent({
      id: `login_${Date.now()}`,
      timestamp: now,
      event: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      details: { email, ipAddress },
      ipAddress
    });
  }

  // Check if account is locked
  isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email) || [];
    const now = new Date();
    
    const recentFailedAttempts = attempts.filter(
      attempt => 
        !attempt.success && 
        now.getTime() - attempt.timestamp.getTime() < this.lockoutDuration
    );
    
    return recentFailedAttempts.length >= this.maxAttempts;
  }

  // Get remaining lockout time
  getRemainingLockoutTime(email: string): number {
    const attempts = this.loginAttempts.get(email) || [];
    if (attempts.length === 0) return 0;
    
    const lastAttempt = attempts[attempts.length - 1];
    const lockoutEnd = lastAttempt.timestamp.getTime() + this.lockoutDuration;
    const now = Date.now();
    
    return Math.max(0, lockoutEnd - now);
  }

  // Security event logging
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const existingLogs = await AsyncStorage.getItem('security_logs');
      const logs: SecurityEvent[] = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push(event);
      
      // Keep only last 1000 events
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      await AsyncStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Get security logs
  async getSecurityLogs(limit: number = 100): Promise<SecurityEvent[]> {
    try {
      const logs = await AsyncStorage.getItem('security_logs');
      if (!logs) return [];
      
      const parsedLogs: SecurityEvent[] = JSON.parse(logs);
      return parsedLogs.slice(-limit).reverse();
    } catch (error) {
      console.error('Failed to get security logs:', error);
      return [];
    }
  }

  // Clear old logs
  async clearOldLogs(olderThanDays: number = 30): Promise<void> {
    try {
      const logs = await this.getSecurityLogs(10000);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const filteredLogs = logs.filter(
        log => new Date(log.timestamp) > cutoffDate
      );
      
      await AsyncStorage.setItem('security_logs', JSON.stringify(filteredLogs));
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }

  // Session management
  async createSession(userId: string, email: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const session = {
      id: sessionId,
      userId,
      email,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };
    
    await AsyncStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    await AsyncStorage.setItem('current_session', sessionId);
    
    await this.logSecurityEvent({
      id: `session_create_${Date.now()}`,
      timestamp: new Date(),
      userId,
      event: 'SESSION_CREATED',
      details: { sessionId, email }
    });
    
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const sessionData = await AsyncStorage.getItem(`session_${sessionId}`);
      if (!sessionData) return false;
      
      const session = JSON.parse(sessionData);
      const now = new Date();
      const lastActivity = new Date(session.lastActivity);
      
      // Session expires after 24 hours of inactivity
      const sessionTimeout = 24 * 60 * 60 * 1000;
      
      if (now.getTime() - lastActivity.getTime() > sessionTimeout) {
        await this.destroySession(sessionId);
        return false;
      }
      
      // Update last activity
      session.lastActivity = now;
      await AsyncStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
      
      return session.isActive;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    try {
      const sessionData = await AsyncStorage.getItem(`session_${sessionId}`);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        await this.logSecurityEvent({
          id: `session_destroy_${Date.now()}`,
          timestamp: new Date(),
          userId: session.userId,
          event: 'SESSION_DESTROYED',
          details: { sessionId }
        });
      }
      
      await AsyncStorage.removeItem(`session_${sessionId}`);
      
      const currentSession = await AsyncStorage.getItem('current_session');
      if (currentSession === sessionId) {
        await AsyncStorage.removeItem('current_session');
      }
    } catch (error) {
      console.error('Session destroy error:', error);
    }
  }
}

export default SecurityService;
