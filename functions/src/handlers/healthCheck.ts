import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { monitoring } from '../lib/monitoring';
import { emailServiceCircuitBreaker, databaseCircuitBreaker } from '../lib/circuitBreaker';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    email: ServiceHealth;
    functions: ServiceHealth;
  };
  metrics: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    performance: any;
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  details?: string;
}

export const healthCheck = onRequest(
  {
    region: 'us-central1',
    memory: '128MiB',
    timeoutSeconds: 10
  },
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const healthStatus = await performHealthCheck();
      const responseTime = Date.now() - startTime;
      
      // Set appropriate status code
      const statusCode = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json({
        ...healthStatus,
        responseTime
      });
      
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      });
    }
  }
);

async function performHealthCheck(): Promise<HealthStatus> {
  const timestamp = new Date().toISOString();
  const services = {
    database: await checkDatabaseHealth(),
    email: await checkEmailServiceHealth(),
    functions: checkFunctionsHealth()
  };
  
  // Determine overall status
  const serviceStatuses = Object.values(services).map(s => s.status);
  const overallStatus = serviceStatuses.includes('down') ? 'unhealthy' :
                       serviceStatuses.includes('degraded') ? 'degraded' : 'healthy';
  
  return {
    status: overallStatus,
    timestamp,
    services,
    metrics: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      performance: monitoring.getPerformanceSummary()
    }
  };
}

async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const db = getFirestore();
    // Simple read operation to test database connectivity
    await db.collection('_health').limit(1).get();
    
    const responseTime = Date.now() - startTime;
    const circuitStats = databaseCircuitBreaker.getStats();
    
    return {
      status: circuitStats.state === 'OPEN' ? 'down' : 'up',
      responseTime,
      lastCheck: new Date().toISOString(),
      details: `Circuit: ${circuitStats.state}, Failures: ${circuitStats.failures}`
    };
  } catch (error) {
    return {
      status: 'down',
      lastCheck: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkEmailServiceHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Check if email service is accessible (without actually sending)
    const circuitStats = emailServiceCircuitBreaker.getStats();
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: circuitStats.state === 'OPEN' ? 'down' : 'up',
      responseTime,
      lastCheck: new Date().toISOString(),
      details: `Circuit: ${circuitStats.state}, Failures: ${circuitStats.failures}`
    };
  } catch (error) {
    return {
      status: 'down',
      lastCheck: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function checkFunctionsHealth(): ServiceHealth {
  try {
    // Check if environment variables are set
    const requiredEnvVars = [
      'RESEND_API_KEY',
      'FROM_EMAIL',
      'FROM_NAME',
      'APP_BASE_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return {
        status: 'degraded',
        lastCheck: new Date().toISOString(),
        details: `Missing environment variables: ${missingVars.join(', ')}`
      };
    }
    
    return {
      status: 'up',
      lastCheck: new Date().toISOString(),
      details: 'All environment variables present'
    };
  } catch (error) {
    return {
      status: 'down',
      lastCheck: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Liveness probe (simple endpoint for Kubernetes)
export const livenessCheck = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 5
  },
  async (req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
);

// Readiness probe (checks if service is ready to accept traffic)
export const readinessCheck = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 5
  },
  async (req, res) => {
    try {
      const healthStatus = await performHealthCheck();
      const isReady = healthStatus.status !== 'unhealthy';
      
      res.status(isReady ? 200 : 503).json({
        ready: isReady,
        timestamp: new Date().toISOString(),
        status: healthStatus.status
      });
    } catch (error) {
      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);
