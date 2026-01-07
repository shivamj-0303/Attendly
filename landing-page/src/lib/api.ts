import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error: AxiosError<{ message?: string; error?: string; errors?: any }>) => {
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
        userMessage = errorData.errors.map((e: any) => e.defaultMessage || e.message).join(', ');
      }
    }

    // Map common HTTP status codes to user-friendly messages
    const status = error.response?.status;
    switch (status) {
      case 400:
        userMessage = errorData?.message || 'Invalid request. Please check your input.';
        break;
      case 401:
        const requestUrl = error.config?.url || '';
        const isAuthAttempt =
          requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup');

        if (!isAuthAttempt) {
          userMessage = 'Session expired. Please login again.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          userMessage = errorData?.message || 'Invalid credentials. Please try again.';
        }
        break;
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
