import { 
  MonitoringService, 
  recordMetric, 
  recordPerformance, 
  recordError, 
  recordEvent,
  withPerformanceTracking 
} from '../lib/monitoring';

describe('Monitoring Service', () => {
  let monitoring: MonitoringService;

  beforeEach(() => {
    monitoring = MonitoringService.getInstance();
    monitoring.clear();
  });

  describe('Metrics Recording', () => {
    it('should record metrics', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      recordMetric('test_metric', 42, { label1: 'value1' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'METRIC:', 
        expect.stringContaining('"name":"test_metric"')
      );
      
      consoleSpy.mockRestore();
    });

    it('should record performance data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      recordPerformance('test_operation', 150, true, { metadata: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'PERFORMANCE:', 
        expect.stringContaining('"operation":"test_operation"')
      );
      
      consoleSpy.mockRestore();
    });

    it('should record errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const error = new Error('Test error');
      recordError(error, { context: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'ERROR:', 
        expect.stringContaining('"name":"Error"')
      );
      
      consoleSpy.mockRestore();
    });

    it('should record events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      recordEvent('test_event', { data: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'EVENT:', 
        expect.stringContaining('"name":"test_event"')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Tracking Decorator', () => {
    it('should track successful operations', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const testFn = withPerformanceTracking('test_operation', async () => {
        return 'success';
      });
      
      const result = await testFn();
      
      expect(result).toBe('success');
      expect(consoleSpy).toHaveBeenCalledWith(
        'PERFORMANCE:', 
        expect.stringContaining('"operation":"test_operation"')
      );
      
      consoleSpy.mockRestore();
    });

    it('should track failed operations', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const testFn = withPerformanceTracking('test_operation', async () => {
        throw new Error('Test error');
      });
      
      await expect(testFn()).rejects.toThrow('Test error');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'PERFORMANCE:', 
        expect.stringContaining('"operation":"test_operation"')
      );
      
      expect(errorSpy).toHaveBeenCalledWith(
        'ERROR:', 
        expect.stringContaining('"name":"Error"')
      );
      
      consoleSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('Metrics Summary', () => {
    it('should generate metrics summary', () => {
      recordMetric('test_metric', 10);
      recordMetric('test_metric', 20);
      recordMetric('test_metric', 30);
      recordMetric('other_metric', 5);
      
      const summary = monitoring.getMetricsSummary();
      
      expect(summary.test_metric).toEqual({
        count: 3,
        sum: 60,
        avg: 20,
        min: 10,
        max: 30
      });
      
      expect(summary.other_metric).toEqual({
        count: 1,
        sum: 5,
        avg: 5,
        min: 5,
        max: 5
      });
    });
  });

  describe('Performance Summary', () => {
    it('should generate performance summary', () => {
      recordPerformance('operation1', 100, true);
      recordPerformance('operation1', 200, true);
      recordPerformance('operation1', 150, false);
      recordPerformance('operation2', 50, true);
      
      const summary = monitoring.getPerformanceSummary();
      
      expect(summary.operation1).toEqual({
        total: 3,
        successful: 2,
        failed: 1,
        successRate: (2/3) * 100,
        avgDuration: 150,
        minDuration: 100,
        maxDuration: 200
      });
      
      expect(summary.operation2).toEqual({
        total: 1,
        successful: 1,
        failed: 0,
        successRate: 100,
        avgDuration: 50,
        minDuration: 50,
        maxDuration: 50
      });
    });
  });
});
