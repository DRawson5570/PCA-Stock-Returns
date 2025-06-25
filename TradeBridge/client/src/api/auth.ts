import api from './api';

// Description: User login authentication
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { success: boolean, data: { user: object, accessToken: string, refreshToken: string } }
export const login = async (credentials: { email: string; password: string }) => {
  console.log('API: Attempting login for email:', credentials.email);
  try {
    const response = await api.post('/api/auth/login', credentials);
    console.log('API: Login response received:', response);
    console.log('API: Login response status:', response.status);
    console.log('API: Login response data:', response.data);
    console.log('API: Login response data structure:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      console.log('API: Login data object:', response.data.data);
      console.log('API: Access token exists:', !!response.data.data.accessToken);
      console.log('API: Refresh token exists:', !!response.data.data.refreshToken);
      console.log('API: User object exists:', !!response.data.data.user);
    }
    
    return response.data;
  } catch (error) {
    console.error('API: Login error:', error);
    console.error('API: Login error response:', error?.response);
    console.error('API: Login error response data:', error?.response?.data);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: User registration
// Endpoint: POST /api/auth/register
// Request: { username?: string, email: string, password: string }
// Response: { success: boolean, data: { user: object, accessToken: string } }
export const register = async (userData: { username?: string; email: string; password: string }) => {
  console.log('API: Attempting registration for email:', userData.email);
  try {
    const response = await api.post('/api/auth/register', userData);
    console.log('API: Registration response received:', response);
    console.log('API: Registration response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Registration error:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: User logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  console.log('API: Attempting logout');
  try {
    const response = await api.post('/api/auth/logout');
    console.log('API: Logout response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Logout error:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};