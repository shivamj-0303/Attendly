import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api.config';

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
export async function getStudentTimetable(date?: string) {
  try {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    const resp = await api.get(`/student/timetable${params}`);
    return resp.data as Array<any>;
  } catch (err) {
    console.warn('getStudentTimetable failed, returning empty', err);
    return [];
  }
}

export async function getStudentAttendance(date?: string) {
  try {
    if (date) {
      const resp = await api.get(`/student/attendance?startDate=${date}&endDate=${date}`);
      return resp.data as Array<any>;
    } else {
      const resp = await api.get('/student/attendance/today');
      return resp.data as Array<any>;
    }
  } catch (err) {
    console.warn('getStudentAttendance failed, returning empty', err);
    return [];
  }
}

export async function getTeacherTimetable(date?: string) {
  try {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    const resp = await api.get(`/teacher/timetable${params}`);
    return resp.data as Array<any>;
  } catch (err) {
    console.warn('getTeacherTimetable failed, returning empty', err);
    return [];
  }
}

export async function getClassStudents(classId: number, slotId: number, date: string) {
  try {
    const resp = await api.get(`/teacher/class/${classId}/students?slotId=${slotId}&date=${date}`);
    return resp.data as Array<any>;
  } catch (err) {
    console.warn('getClassStudents failed, returning empty', err);
    return [];
  }
}

export async function markAttendance(attendanceData: any[]) {
  try {
    const resp = await api.post('/admin/attendance/mark/bulk', attendanceData);
    return resp.data;
  } catch (err: any) {
    console.error('markAttendance failed', err);
    throw new Error(err.response?.data?.message || 'Failed to mark attendance');
  }
}

