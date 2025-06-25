import api from './api';

// Description: Get connected Elwave clients
// Endpoint: GET /api/connections/clients
// Request: {}
// Response: { clients: Array<{ id: string, name: string, status: string, connectedAt: string, requestCount: number, symbols: Array<string> }> }
export const getConnectedClients = () => {
  console.log('API: Fetching connected clients');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        clients: [
          {
            id: 'client_001',
            name: 'Elwave Pro - Workstation 1',
            status: 'connected',
            connectedAt: '2024-01-15T10:30:00Z',
            requestCount: 1547,
            symbols: ['EUR/USD', 'GBP/USD', 'USD/JPY']
          },
          {
            id: 'client_002',
            name: 'Elwave Standard - Laptop',
            status: 'connected',
            connectedAt: '2024-01-15T11:45:00Z',
            requestCount: 892,
            symbols: ['EUR/USD', 'AUD/USD']
          },
          {
            id: 'client_003',
            name: 'Elwave Pro - Workstation 2',
            status: 'disconnected',
            connectedAt: '2024-01-15T09:15:00Z',
            requestCount: 234,
            symbols: []
          }
        ]
      });
    }, 700);
  });
};

// Description: Get DDE request monitoring data
// Endpoint: GET /api/connections/requests
// Request: {}
// Response: { requests: Array<{ timestamp: string, client: string, command: string, topic: string, item: string, status: string, responseTime: number }> }
export const getDDERequests = () => {
  console.log('API: Fetching DDE request monitoring data');
  const commands = ['REQUEST', 'ADVISE', 'POKE'];
  const topics = ['PRICES', 'HISTORICAL', 'STATUS'];
  const items = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'CONNECTION'];
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requests: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 1000 * 30).toISOString(),
          client: `client_00${Math.floor(Math.random() * 3) + 1}`,
          command: commands[Math.floor(Math.random() * commands.length)],
          topic: topics[Math.floor(Math.random() * topics.length)],
          item: items[Math.floor(Math.random() * items.length)],
          status: Math.random() > 0.1 ? 'success' : 'error',
          responseTime: Math.floor(Math.random() * 100) + 10
        }))
      });
    }, 500);
  });
};