// src/utils/SecurityEnhancements.ts
import { User } from '../types';

interface SecurityPolicy {
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number; // in minutes
}

interface LoginAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
}

export class SecurityManager {
  private static readonly SECURITY_POLICY: SecurityPolicy = {
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30
  };

  private static loginAttempts: LoginAttempt[] = [];

  // Password strength validation
  static validatePasswordStrength(password: string): { 
    isValid: boolean; 
    score: number; 
    feedback: string[] 
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= this.SECURITY_POLICY.passwordMinLength) {
      score += 20;
    } else {
      feedback.push(`Password must be at least ${this.SECURITY_POLICY.passwordMinLength} characters`);
    }

    // Uppercase check
    if (this.SECURITY_POLICY.requireUppercase && /[A-Z]/.test(password)) {
      score += 20;
    } else if (this.SECURITY_POLICY.requireUppercase) {
      feedback.push('Password must contain uppercase letters');
    }

    // Numbers check
    if (this.SECURITY_POLICY.requireNumbers && /\d/.test(password)) {
      score += 20;
    } else if (this.SECURITY_POLICY.requireNumbers) {
      feedback.push('Password must contain numbers');
    }

    // Special characters check
    if (this.SECURITY_POLICY.requireSpecialChars && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    } else if (this.SECURITY_POLICY.requireSpecialChars) {
      feedback.push('Password must contain special characters');
    }

    // Additional complexity
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 10;

    return {
      isValid: score >= 80 && feedback.length === 0,
      score,
      feedback
    };
  }

  // Rate limiting for login attempts
  static checkLoginRateLimit(email: string): { allowed: boolean; remainingAttempts: number } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Clean old attempts
    this.loginAttempts = this.loginAttempts.filter(attempt => attempt.timestamp > oneHourAgo);

    // Count failed attempts for this email
    const failedAttempts = this.loginAttempts.filter(
      attempt => attempt.email === email && !attempt.success
    ).length;

    const remainingAttempts = this.SECURITY_POLICY.maxLoginAttempts - failedAttempts;

    return {
      allowed: failedAttempts < this.SECURITY_POLICY.maxLoginAttempts,
      remainingAttempts: Math.max(0, remainingAttempts)
    };
  }

  // Log login attempt
  static logLoginAttempt(email: string, success: boolean, ipAddress?: string): void {
    this.loginAttempts.push({
      email,
      timestamp: new Date(),
      success,
      ipAddress
    });

    // Keep only last 1000 attempts to prevent memory issues
    if (this.loginAttempts.length > 1000) {
      this.loginAttempts = this.loginAttempts.slice(-1000);
    }
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }

  // Username validation with security rules
  static validateUsername(username: string): { isValid: boolean; message?: string } {
    const sanitized = this.sanitizeInput(username);
    
    if (sanitized.length < 3) {
      return { isValid: false, message: 'Username must be at least 3 characters' };
    }

    if (sanitized.length > 20) {
      return { isValid: false, message: 'Username must be less than 20 characters' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
      return { isValid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }

    // Check for prohibited usernames
    const prohibitedUsernames = ['admin', 'root', 'administrator', 'system', 'test'];
    if (prohibitedUsernames.includes(sanitized.toLowerCase())) {
      return { isValid: false, message: 'This username is not allowed' };
    }

    return { isValid: true };
  }

  // Session management
  static isSessionValid(lastActivity: Date): boolean {
    const now = new Date();
    const sessionTimeout = this.SECURITY_POLICY.sessionTimeout * 60 * 1000; // Convert to milliseconds
    
    return now.getTime() - lastActivity.getTime() < sessionTimeout;
  }

  // Generate secure temporary passwords
  static generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Security audit log
  static logSecurityEvent(event: string, user?: User, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      user: user ? { uid: user.uid, email: user.email, role: user.role } : null,
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    };

    console.log('🔒 Security Event:', logEntry);
    
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to security monitoring service
    }
  }

  // Data encryption utilities (for sensitive data)
  static async hashData(data: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for environments without crypto.subtle
    return btoa(data);
  }
}
