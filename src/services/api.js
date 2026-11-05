import axios from 'axios';
import { getToken, clearAuthSession } from '../utils/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // Ensure we never prefix with double Bearer
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      config.headers.Authorization = `Bearer ${cleanToken.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Format responses and handle 401/403
api.interceptors.response.use(
  (response) => {
    // Backend standard ITDCMADA envelope: { status, message, data, signature }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    if (status === 401) {
      clearAuthSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Extract human-readable error message
    let errorMessage = 'Une erreur inattendue est survenue';
    if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      errorMessage = responseData.errors.join(', ');
    } else if (responseData?.message) {
      errorMessage = responseData.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.status = status;
    enhancedError.originalError = error;
    enhancedError.data = responseData;

    return Promise.reject(enhancedError);
  },
);

export default api;
