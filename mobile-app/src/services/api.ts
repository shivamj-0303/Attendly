import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * API Configuration
 * Determines the backend URL from environment variables with fallback priority:
 * 1. Expo config (from app.config.js)
 * 2. Environment variable EXPO_PUBLIC_API_URL
 * 3. Localhost fallback for local development
 */
const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  'http://192.168.1.58:8080/api';

/**
 * Axios instance configured for the Attendly API
 * - Includes authentication token in requests
 * - Handles 401 errors by clearing auth and redirecting to login
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches JWT token to all outgoing requests if available
 */
api.interceptors.request.use(
  async (config) => {
    const authToken = await AsyncStorage.getItem('token');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles authentication errors (401) by clearing stored credentials
 * This forces the user to re-authenticate on token expiration
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data on unauthorized response
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: string;
}

export const authService = {
  login: async (credentials: LoginRequest, userType: 'student' | 'teacher' = 'student'): Promise<AuthResponse> => {
    const endpoint = userType === 'student' ? '/auth/user/student/login' : '/auth/user/teacher/login';
    const response = await api.post(endpoint, credentials);
    const { token, id, name, email, role } = response.data;
    
    // Store token and user data
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify({ id, name, email, role }));
    
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    const { token, id, name, email, role } = response.data;
    
    // Store token and user data
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify({ id, name, email, role }));
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};

export default api;
