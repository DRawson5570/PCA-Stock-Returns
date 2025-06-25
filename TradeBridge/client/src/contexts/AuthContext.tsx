import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authAPI from '@/api/auth';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { username?: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('AuthContext: Starting login process');
      const response = await authAPI.login(credentials);
      console.log('AuthContext: Login API response:', response);
      console.log('AuthContext: Response structure:', JSON.stringify(response, null, 2));
      
      if (!response || !response.data) {
        console.error('AuthContext: No data in response');
        throw new Error('Login failed - invalid response structure');
      }
      
      const { user: userData, accessToken, refreshToken } = response.data;
      console.log('AuthContext: Extracted data - user:', userData, 'accessToken exists:', !!accessToken, 'refreshToken exists:', !!refreshToken);
      
      if (!accessToken) {
        console.error('AuthContext: No access token in response');
        throw new Error('Login failed - no tokens received');
      }
      
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      console.log('AuthContext: Tokens stored in localStorage');
      
      setUser(userData);
      console.log('AuthContext: User state updated:', userData);
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const register = async (userData: { username?: string; email: string; password: string }) => {
    try {
      console.log('AuthContext: Starting registration process');
      const response = await authAPI.register(userData);
      console.log('AuthContext: Registration API response:', response);
      
      if (!response || !response.data) {
        console.error('AuthContext: No data in registration response');
        throw new Error('Registration failed - invalid response structure');
      }
      
      const { user: newUser, accessToken } = response.data;
      console.log('AuthContext: Registration data - user:', newUser, 'accessToken exists:', !!accessToken);
      
      if (!accessToken) {
        console.error('AuthContext: No access token in registration response');
        throw new Error('Registration failed - no token received');
      }
      
      localStorage.setItem('accessToken', accessToken);
      console.log('AuthContext: Access token stored for registration');
      
      setUser(newUser);
      console.log('AuthContext: User state updated after registration:', newUser);
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Starting logout process');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    console.log('AuthContext: Logout completed');
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('AuthContext: Checking for existing token on mount:', !!token);
    if (token) {
      // In a real app, you'd validate the token with the server
      console.log('AuthContext: Token found, but user validation not implemented');
      // For now, we'll just assume the user is logged in if token exists
      // You might want to add token validation here
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}