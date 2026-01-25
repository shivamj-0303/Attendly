import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const api = axios.create({
  baseURL: API_BASE_URL,
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

// Request interceptor to add token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string; errors?: unknown }>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // Handle token refresh on 401
    if (error.response?.status === 401 && !originalRequest?._retry) {
      const requestUrl = originalRequest?.url || '';
      const isLoginAttempt = requestUrl.includes('/auth/login');
      const isSignupAttempt = requestUrl.includes('/auth/signup');
      const isRefreshAttempt = requestUrl.includes('/auth/refresh');
      const isAuthAttempt = isLoginAttempt || isSignupAttempt || isRefreshAttempt;

      if (!isAuthAttempt) {
        if (isRefreshing) {
          // Queue this request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token as string}`;
              }
              return api(originalRequest);
            })
            .catch((err: unknown) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        const userRole = localStorage.getItem('userRole');

        if (!refreshToken || !userRole) {
          // No refresh token available, clear auth and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
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
          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Update the original request and all queued requests
          originalRequest.headers.Authorization = `Bearer ${token}`;
          processQueue(null, token);
          isRefreshing = false;

          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear everything and redirect
          processQueue(refreshError, null);
          isRefreshing = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // Extract user-friendly error message
    const errorData = error.response?.data;
    let userMessage = 'An error occurred. Please try again.';

    if (errorData) {
      // Priority: message > error > generic
      if (errorData.message) {
        userMessage = errorData.message;
      } else if (errorData.error) {
        userMessage = errorData.error;
      }

      // Handle validation errors (Spring Boot format)
      if (errorData.errors && Array.isArray(errorData.errors)) {
        userMessage = errorData.errors
          .map((e: { defaultMessage?: string; message?: string }) => e.defaultMessage || e.message)
          .filter((msg): msg is string => typeof msg === 'string')
          .join(', ');
      }
    }

    // Map common HTTP status codes to user-friendly messages
    const status = error.response?.status;
    switch (status) {
      case 400:
        userMessage = errorData?.message || 'Invalid request. Please check your input.';
        break;
      case 401: {
        const requestUrl = error.config?.url || '';
        const isAuthAttempt =
          requestUrl.includes('/auth/login') ||
          requestUrl.includes('/auth/signup') ||
          requestUrl.includes('/auth/refresh');

        if (!isAuthAttempt) {
          // Already handled by refresh logic above, just set message
          userMessage = 'Session expired. Please login again.';
        } else {
          userMessage = errorData?.message || 'Invalid credentials. Please try again.';
        }
        break;
      }
      case 403:
        userMessage = errorData?.message || 'You do not have permission to perform this action.';
        break;
      case 404:
        userMessage = errorData?.message || 'The requested resource was not found.';
        break;
      case 409:
        userMessage = errorData?.message || 'This resource already exists.';
        break;
      case 422:
        userMessage = errorData?.message || 'Validation failed. Please check your input.';
        break;
      case 500:
        userMessage = 'Server error. Please try again later or contact support.';
        break;
      case 503:
        userMessage = 'Service temporarily unavailable. Please try again later.';
        break;
    }

    // Attach user-friendly message to error object
    const enhancedError: any = error;
    enhancedError.message = userMessage;
    enhancedError.userMessage = userMessage;

    return Promise.reject(enhancedError);
  }
);

export default api;
