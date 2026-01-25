import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api.config';

/**
 * Axios instance configured for the Attendly API
 * - Includes authentication token in requests
 * - Handles 401 errors by attempting refresh token flow
 * - Falls back to logout if refresh fails
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
 * Handles authentication errors (401) by attempting to refresh the token
 * If refresh fails, clears stored credentials and forces re-authentication
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userRole = await AsyncStorage.getItem('userRole');

      if (!refreshToken || !userRole) {
        // No refresh token available, clear auth
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userRole');
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Determine refresh endpoint based on user role
        const refreshEndpoint =
          userRole === 'STUDENT'
            ? '/auth/user/student/refresh'
            : userRole === 'TEACHER'
            ? '/auth/user/teacher/refresh'
            : '/auth/refresh';

        const response = await axios.post(
          `${API_BASE_URL}${refreshEndpoint}`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { token, refreshToken: newRefreshToken } = response.data;

        // Update stored tokens
        await AsyncStorage.setItem('token', token);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update the original request and all queued requests
        originalRequest.headers.Authorization = `Bearer ${token}`;
        processQueue(null, token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear everything
        processQueue(refreshError, null);
        isRefreshing = false;
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userRole');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
  phone: string;
  registrationNumber?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: string;
}

export const authService = {
  login: async (
    credentials: LoginRequest,
    userType: 'student' | 'teacher' = 'student'
  ): Promise<AuthResponse> => {
    const endpoint =
      userType === 'student' ? '/auth/user/student/login' : '/auth/user/teacher/login';
    const response = await api.post(endpoint, credentials);
    const { token, refreshToken, id, name, email, role } = response.data;

    // Store token, refresh token, and user data
    await AsyncStorage.setItem('token', token);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    await AsyncStorage.setItem('user', JSON.stringify({ id, name, email, role }));
    await AsyncStorage.setItem('userRole', role);

    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    const { token, refreshToken, id, name, email, role } = response.data;

    // Store token, refresh token, and user data
    await AsyncStorage.setItem('token', token);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    await AsyncStorage.setItem('user', JSON.stringify({ id, name, email, role }));
    await AsyncStorage.setItem('userRole', role);

    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('userRole');
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

export async function getStudentAttendanceReport(token: string) {
  try {
    const resp = await api.get('/student/attendance/report', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resp.data;
  } catch (err) {
    console.warn('getStudentAttendanceReport failed', err);
    throw err;
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
