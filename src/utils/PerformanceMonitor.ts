// src/utils/PerformanceMonitor.ts
// Performance monitoring utility for ERP system

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(name: string): void {
    const metric: PerformanceMetric = {
      name: `${name}_start`,
      value: performance.now(),
      timestamp: new Date(),
    };
    this.metrics.push(metric);
  }

  endTiming(name: string): number {
    const endTime = performance.now();
    const startMetric = this.metrics.find(m => m.name === `${name}_start`);

    if (startMetric) {
      const duration = endTime - startMetric.value;
      const endMetric: PerformanceMetric = {
        name: `${name}_duration`,
        value: duration,
        timestamp: new Date(),
      };
      this.metrics.push(endMetric);
      return duration;
    }
    return 0;
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export default PerformanceMonitor;
