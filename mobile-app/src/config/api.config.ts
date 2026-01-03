/**
 * API Configuration
 * Metro bundler inlines process.env.EXPO_PUBLIC_* at build time
 * For local dev with npm start, use fallback to localhost
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.58:8080/api';

// For debugging - this will show what was baked in
console.log('📡 API_BASE_URL configured as:', API_BASE_URL);
