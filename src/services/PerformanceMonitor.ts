import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  metric: string;
  value: number;
  unit: string;
  details?: any;
}

export interface LoadTimeMetric {
  screen: string;
  loadTime: number;
  timestamp: Date;
  userId?: string;
}

export interface NetworkMetric {
  timestamp: Date;
  latency: number;
  downloadSpeed?: number;
  uploadSpeed?: number;
  connectionType?: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private startTimes: Map<string, number> = new Map();
  private metrics: PerformanceMetric[] = [];
  private loadTimes: LoadTimeMetric[] = [];
  private networkMetrics: NetworkMetric[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing a process
  startTiming(processName: string): void {
    this.startTimes.set(processName, Date.now());
  }

  // End timing and record metric
  async endTiming(processName: string, details?: any): Promise<number> {
    const startTime = this.startTimes.get(processName);
    if (!startTime) {
      console.warn(`No start time found for process: ${processName}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(processName);

    const metric: PerformanceMetric = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date(),
      metric: processName,
      value: duration,
      unit: 'ms',
      details
    };

    await this.recordMetric(metric);
    return duration;
  }

  // Record a performance metric
  async recordMetric(metric: PerformanceMetric): Promise<void> {
    try {
      this.metrics.push(metric);
      
      // Keep only last 500 metrics in memory
      if (this.metrics.length > 500) {
        this.metrics.splice(0, 100);
      }

      // Save to storage
      const existingMetrics = await AsyncStorage.getItem('performance_metrics');
      const allMetrics: PerformanceMetric[] = existingMetrics ? JSON.parse(existingMetrics) : [];
      
      allMetrics.push(metric);
      
      // Keep only last 1000 metrics in storage
      if (allMetrics.length > 1000) {
        allMetrics.splice(0, allMetrics.length - 1000);
      }
      
      await AsyncStorage.setItem('performance_metrics', JSON.stringify(allMetrics));
    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }

  // Record screen load time
  async recordLoadTime(screen: string, loadTime: number, userId?: string): Promise<void> {
    const loadTimeMetric: LoadTimeMetric = {
      screen,
      loadTime,
      timestamp: new Date(),
      userId
    };

    this.loadTimes.push(loadTimeMetric);

    // Keep only last 100 load times in memory
    if (this.loadTimes.length > 100) {
      this.loadTimes.splice(0, 50);
    }

    // Save to storage
    try {
      const existingLoadTimes = await AsyncStorage.getItem('load_times');
      const allLoadTimes: LoadTimeMetric[] = existingLoadTimes ? JSON.parse(existingLoadTimes) : [];
      
      allLoadTimes.push(loadTimeMetric);
      
      // Keep only last 500 load times
      if (allLoadTimes.length > 500) {
        allLoadTimes.splice(0, allLoadTimes.length - 500);
      }
      
      await AsyncStorage.setItem('load_times', JSON.stringify(allLoadTimes));
    } catch (error) {
      console.error('Failed to record load time:', error);
    }
  }

  // Test network performance
  async testNetworkPerformance(): Promise<NetworkMetric | null> {
    try {
      const startTime = Date.now();
      const testUrl = 'https://www.google.com/favicon.ico';
      
      const response = await fetch(testUrl, {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (response.ok) {
        const networkMetric: NetworkMetric = {
          timestamp: new Date(),
          latency,
          connectionType: this.getConnectionType()
        };
        
        this.networkMetrics.push(networkMetric);
        
        // Keep only last 50 network metrics
        if (this.networkMetrics.length > 50) {
          this.networkMetrics.splice(0, 25);
        }
        
        await this.recordMetric({
          id: `network_${Date.now()}`,
          timestamp: new Date(),
          metric: 'network_latency',
          value: latency,
          unit: 'ms',
          details: { connectionType: networkMetric.connectionType }
        });
        
        return networkMetric;
      }
    } catch (error) {
      console.error('Network performance test failed:', error);
    }
    
    return null;
  }

  // Get connection type (platform specific)
  private getConnectionType(): string {
    // This is a simplified version - in a real app you'd use @react-native-community/netinfo
    return Platform.OS === 'web' ? 'wifi' : 'unknown';
  }

  // Get performance statistics
  async getPerformanceStats(): Promise<{
    averageLoadTime: number;
    screenStats: { [screen: string]: { average: number; count: number } };
    networkStats: { averageLatency: number; testCount: number };
    recentMetrics: PerformanceMetric[];
  }> {
    try {
      const loadTimesData = await AsyncStorage.getItem('load_times');
      const loadTimes: LoadTimeMetric[] = loadTimesData ? JSON.parse(loadTimesData) : [];
      
      const metricsData = await AsyncStorage.getItem('performance_metrics');
      const metrics: PerformanceMetric[] = metricsData ? JSON.parse(metricsData) : [];
      
      // Calculate average load time
      const totalLoadTime = loadTimes.reduce((sum, lt) => sum + lt.loadTime, 0);
      const averageLoadTime = loadTimes.length > 0 ? totalLoadTime / loadTimes.length : 0;
      
      // Calculate screen-specific stats
      const screenStats: { [screen: string]: { average: number; count: number } } = {};
      loadTimes.forEach(lt => {
        if (!screenStats[lt.screen]) {
          screenStats[lt.screen] = { average: 0, count: 0 };
        }
        screenStats[lt.screen].count++;
      });
      
      Object.keys(screenStats).forEach(screen => {
        const screenLoadTimes = loadTimes.filter(lt => lt.screen === screen);
        const total = screenLoadTimes.reduce((sum, lt) => sum + lt.loadTime, 0);
        screenStats[screen].average = total / screenLoadTimes.length;
      });
      
      // Calculate network stats
      const networkLatencies = this.networkMetrics.map(nm => nm.latency);
      const averageLatency = networkLatencies.length > 0 
        ? networkLatencies.reduce((sum, lat) => sum + lat, 0) / networkLatencies.length 
        : 0;
      
      return {
        averageLoadTime,
        screenStats,
        networkStats: {
          averageLatency,
          testCount: this.networkMetrics.length
        },
        recentMetrics: metrics.slice(-20)
      };
    } catch (error) {
      console.error('Failed to get performance stats:', error);
      return {
        averageLoadTime: 0,
        screenStats: {},
        networkStats: { averageLatency: 0, testCount: 0 },
        recentMetrics: []
      };
    }
  }

  // Memory usage monitoring (simplified)
  async recordMemoryUsage(): Promise<void> {
    try {
      // This is a basic implementation - in a real app you'd use more sophisticated memory monitoring
      const memoryMetric: PerformanceMetric = {
        id: `memory_${Date.now()}`,
        timestamp: new Date(),
        metric: 'memory_usage',
        value: this.getApproximateMemoryUsage(),
        unit: 'MB',
        details: { platform: Platform.OS }
      };
      
      await this.recordMetric(memoryMetric);
    } catch (error) {
      console.error('Failed to record memory usage:', error);
    }
  }

  private getApproximateMemoryUsage(): number {
    // This is a very basic estimation - in production you'd use actual memory monitoring
    return Math.round(Math.random() * 100 + 50); // Random value between 50-150 MB
  }

  // Clear old performance data
  async clearOldData(olderThanDays: number = 7): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      // Clear metrics
      const metricsData = await AsyncStorage.getItem('performance_metrics');
      if (metricsData) {
        const metrics: PerformanceMetric[] = JSON.parse(metricsData);
        const filteredMetrics = metrics.filter(
          metric => new Date(metric.timestamp) > cutoffDate
        );
        await AsyncStorage.setItem('performance_metrics', JSON.stringify(filteredMetrics));
      }
      
      // Clear load times
      const loadTimesData = await AsyncStorage.getItem('load_times');
      if (loadTimesData) {
        const loadTimes: LoadTimeMetric[] = JSON.parse(loadTimesData);
        const filteredLoadTimes = loadTimes.filter(
          lt => new Date(lt.timestamp) > cutoffDate
        );
        await AsyncStorage.setItem('load_times', JSON.stringify(filteredLoadTimes));
      }
    } catch (error) {
      console.error('Failed to clear old performance data:', error);
    }
  }

  // Export performance data
  async exportPerformanceData(): Promise<string> {
    try {
      const stats = await this.getPerformanceStats();
      const loadTimesData = await AsyncStorage.getItem('load_times');
      const metricsData = await AsyncStorage.getItem('performance_metrics');
      
      const exportData = {
        exportDate: new Date().toISOString(),
        stats,
        rawData: {
          loadTimes: loadTimesData ? JSON.parse(loadTimesData) : [],
          metrics: metricsData ? JSON.parse(metricsData) : [],
          networkMetrics: this.networkMetrics
        }
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export performance data:', error);
      return '{}';
    }
  }
}

export default PerformanceMonitor;
