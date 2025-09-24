// import { getFunctions } from 'firebase-admin/functions';

export interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

export interface PerformanceData {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private metrics: MetricData[] = [];
  private performanceData: PerformanceData[] = [];

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Record custom metrics
  public recordMetric(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric: MetricData = {
      name,
      value,
      labels,
      timestamp: new Date()
    };
    
    this.metrics.push(metric);
    console.log('METRIC:', JSON.stringify(metric));
  }

  // Record performance data
  public recordPerformance(operation: string, duration: number, success: boolean, metadata?: Record<string, any>): void {
    const perfData: PerformanceData = {
      operation,
      duration,
      success,
      metadata
    };
    
    this.performanceData.push(perfData);
    console.log('PERFORMANCE:', JSON.stringify(perfData));
  }

  // Record error with context
  public recordError(error: Error, context: Record<string, any> = {}): void {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    console.error('ERROR:', JSON.stringify(errorData));
  }

  // Record business events
  public recordEvent(eventName: string, data: Record<string, any> = {}): void {
    const event = {
      name: eventName,
      data,
      timestamp: new Date().toISOString()
    };
    
    console.log('EVENT:', JSON.stringify(event));
  }

  // Performance decorator
  public withPerformanceTracking<T extends any[], R>(
    operationName: string,
    fn: (...args: T) => Promise<R>
  ) {
    return async (...args: T): Promise<R> => {
      const startTime = Date.now();
      let success = true;
      
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        success = false;
        this.recordError(error as Error, { operation: operationName });
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        this.recordPerformance(operationName, duration, success);
      }
    };
  }

  // Get metrics summary
  public getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    // Group metrics by name
    const groupedMetrics = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);
    
    // Calculate statistics
    for (const [name, values] of Object.entries(groupedMetrics)) {
      summary[name] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }
    
    return summary;
  }

  // Get performance summary
  public getPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    // Group performance data by operation
    const groupedPerf = this.performanceData.reduce((acc, perf) => {
      if (!acc[perf.operation]) {
        acc[perf.operation] = { total: 0, successful: 0, failed: 0, durations: [] };
      }
      
      acc[perf.operation].total++;
      if (perf.success) {
        acc[perf.operation].successful++;
      } else {
        acc[perf.operation].failed++;
      }
      acc[perf.operation].durations.push(perf.duration);
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate statistics
    for (const [operation, data] of Object.entries(groupedPerf)) {
      const durations = data.durations;
      summary[operation] = {
        total: data.total,
        successful: data.successful,
        failed: data.failed,
        successRate: (data.successful / data.total) * 100,
        avgDuration: durations.reduce((a: number, b: number) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations)
      };
    }
    
    return summary;
  }

  // Clear all data (for testing)
  public clear(): void {
    this.metrics = [];
    this.performanceData = [];
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Convenience functions
export const recordMetric = (name: string, value: number, labels?: Record<string, string>) => 
  monitoring.recordMetric(name, value, labels);

export const recordPerformance = (operation: string, duration: number, success: boolean, metadata?: Record<string, any>) => 
  monitoring.recordPerformance(operation, duration, success, metadata);

export const recordError = (error: Error, context?: Record<string, any>) => 
  monitoring.recordError(error, context);

export const recordEvent = (eventName: string, data?: Record<string, any>) => 
  monitoring.recordEvent(eventName, data);

export const withPerformanceTracking = <T extends any[], R>(
  operationName: string,
  fn: (...args: T) => Promise<R>
) => monitoring.withPerformanceTracking(operationName, fn);
