import api from './api';

// Description: Get system error logs
// Endpoint: GET /api/error-logs
// Request: { level?: string, limit?: number }
// Response: { logs: Array<{ timestamp: string, level: string, message: string, source: string, details?: string }> }
export const getErrorLogs = (filters?: { level?: string; limit?: number }) => {
  console.log('API: Fetching error logs', filters);
  const levels = ['error', 'warning', 'info'];
  const sources = ['Oanda API', 'DDE Server', 'Data Processor', 'Connection Manager'];
  const messages = [
    'Failed to connect to Oanda streaming API',
    'DDE client disconnected unexpectedly',
    'Rate limit exceeded for Oanda API',
    'Historical data request timeout',
    'Invalid symbol requested',
    'Connection restored successfully',
    'Data quality check failed',
    'Memory usage threshold exceeded'
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        logs: Array.from({ length: 50 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 1000 * 60 * Math.random() * 10).toISOString(),
          level: levels[Math.floor(Math.random() * levels.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          details: Math.random() > 0.7 ? 'Additional error context and stack trace information...' : undefined
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      });
    }, 600);
  });
};