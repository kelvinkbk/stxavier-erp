// src/utils/PerformanceMonitor.ts
import { User } from '../types';

interface PerformanceMetrics {
  loadTime: number;
  userCount: number;
  errorCount: number;
  lastUpdate: Date;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics = {
    loadTime: 0,
    userCount: 0,
    errorCount: 0,
    lastUpdate: new Date()
  };

  static startLoadTimer(): number {
    return performance.now();
  }

  static endLoadTimer(startTime: number): void {
    const loadTime = performance.now() - startTime;
    this.metrics.loadTime = loadTime;
    this.metrics.lastUpdate = new Date();
    
    console.log(`⚡ Page Load Time: ${loadTime.toFixed(2)}ms`);
    
    // Log performance warnings
    if (loadTime > 3000) {
      console.warn('🐌 Slow page load detected. Consider optimizing.');
    }
  }

  static incrementUserCount(): void {
    this.metrics.userCount++;
  }

  static incrementErrorCount(): void {
    this.metrics.errorCount++;
  }

  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  static logHealthCheck(): void {
    console.log('🏥 Health Check:', {
      status: 'healthy',
      loadTime: `${this.metrics.loadTime.toFixed(2)}ms`,
      users: this.metrics.userCount,
      errors: this.metrics.errorCount,
      lastUpdate: this.metrics.lastUpdate.toISOString()
    });
  }
}

// Network quality detection
export class NetworkMonitor {
  static async checkConnection(): Promise<'online' | 'offline' | 'slow'> {
    if (!navigator.onLine) {
      return 'offline';
    }

    try {
      const start = performance.now();
      await fetch('/ping', { method: 'HEAD' });
      const responseTime = performance.now() - start;

      if (responseTime > 2000) {
        return 'slow';
      }
      return 'online';
    } catch {
      return 'offline';
    }
  }

  static startNetworkMonitoring(): void {
    setInterval(async () => {
      const status = await this.checkConnection();
      
      if (status === 'offline') {
        console.warn('📡 Network connection lost');
      } else if (status === 'slow') {
        console.warn('🐌 Slow network detected');
      }
    }, 30000); // Check every 30 seconds
  }
}

// Error boundary for better error handling
export class ErrorReporter {
  static reportError(error: Error, context?: string): void {
    console.error(`❌ Error${context ? ` in ${context}` : ''}:`, error);
    
    PerformanceMonitor.incrementErrorCount();
    
    // In production, you could send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (Sentry, LogRocket, etc.)
    }
  }

  static reportUserAction(action: string, details?: any): void {
    console.log(`👤 User Action: ${action}`, details);
  }
}
