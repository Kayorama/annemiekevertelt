// Sentry Configuration for RenderOwl
// https://sentry.io/organizations/renderowl

export const sentryConfig = {
  dsn: process.env.SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.RENDEROWL_VERSION || 'unknown',

  // Tracing
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Performance monitoring
  profilesSampleRate: 0.1,

  // Error filtering
  beforeSend(event) {
    // Filter out known non-error events
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error) {
        // Ignore specific errors
        const ignoredErrors = [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection',
          'Network request failed'
        ];

        if (ignoredErrors.some(ignored => error.value?.includes(ignored))) {
          return null;
        }
      }
    }
    return event;
  },

  // Tags for filtering
  tags: {
    service: process.env.SERVICE_NAME || 'unknown',
    component: process.env.COMPONENT || 'unknown'
  }
};

// Alert rules configuration
export const alertRules = {
  // High error rate
  errorRate: {
    name: 'High Error Rate',
    threshold: 10, // errors per minute
    window: '5m',
    severity: 'warning',
    channels: ['email', 'slack']
  },

  // Failed renders
  failedRenders: {
    name: 'Video Render Failures',
    threshold: 5, // failed renders in 10 minutes
    window: '10m',
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty']
  },

  // API latency
  apiLatency: {
    name: 'API Latency Spike',
    threshold: 2000, // 2 seconds
    window: '5m',
    severity: 'warning',
    channels: ['slack']
  },

  // Worker queue depth
  queueDepth: {
    name: 'Worker Queue Backlog',
    threshold: 100, // pending jobs
    window: '5m',
    severity: 'warning',
    channels: ['slack']
  },

  // Database connection failures
  dbConnection: {
    name: 'Database Connection Issues',
    threshold: 3, // failed connections
    window: '2m',
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty']
  }
};

// Performance alerts
export const performanceAlerts = {
  // Apdex score degradation
  apdex: {
    name: 'Apdex Score Drop',
    threshold: 0.7,
    window: '10m',
    severity: 'warning'
  },

  // Throughput drop
  throughput: {
    name: 'API Throughput Drop',
    threshold: -50, // 50% decrease
    window: '15m',
    severity: 'critical'
  }
};
