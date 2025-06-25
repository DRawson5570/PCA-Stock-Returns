import api from './api';

// Description: Get current configuration settings
// Endpoint: GET /api/configuration
// Request: {}
// Response: { success: boolean, data: { oandaConfig: { apiKey: string, accountId: string, environment: string }, ddeConfig: { serviceName: string, refreshInterval: number }, historicalConfig: { maxDays: number, defaultTimeframe: string } } }
export const getConfiguration = async () => {
  console.log('API: Fetching configuration settings');
  
  try {
    const response = await api.get('/api/configuration');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching configuration:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }

  // Fallback to mock data for development
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       oandaConfig: {
  //         apiKey: '****-****-****-****',
  //         accountId: '101-004-1234567-001',
  //         environment: 'practice'
  //       },
  //       ddeConfig: {
  //         serviceName: 'ElwaveDDE',
  //         refreshInterval: 1000
  //       },
  //       historicalConfig: {
  //         maxDays: 30,
  //         defaultTimeframe: '1H'
  //       }
  //     });
  //   }, 500);
  // });
};

// Description: Update configuration settings
// Endpoint: POST /api/configuration
// Request: { oandaConfig?: object, ddeConfig?: object, historicalConfig?: object }
// Response: { success: boolean, data: { success: boolean, message: string } }
export const updateConfiguration = async (config: any) => {
  console.log('API: Updating configuration settings', config);
  
  try {
    const response = await api.post('/api/configuration', config);
    return response.data.data;
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }

  // Fallback to mock data for development
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       success: true,
  //       message: 'Configuration updated successfully'
  //     });
  //   }, 1000);
  // });
};

// Description: Validate OANDA configuration
// Endpoint: GET /api/configuration/validate-oanda
// Request: {}
// Response: { success: boolean, data: { valid: boolean, message: string } }
export const validateOandaConfiguration = async () => {
  console.log('API: Validating OANDA configuration');
  
  try {
    const response = await api.get('/api/configuration/validate-oanda');
    return response.data.data;
  } catch (error) {
    console.error('Error validating OANDA configuration:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};