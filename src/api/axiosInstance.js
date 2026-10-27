/**
 * Axios instance — pre-configured for TapsLog backend
 * Base URL: http://localhost:5000
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tapslog_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // Attach a friendly error code for UI consumption
    if (status === 403) {
      error.errorCode = 'ERROR_403';
      error.friendlyMessage = `Section Mismatch: ${message}`;
    } else if (status === 409) {
      error.errorCode = 'ERROR_409';
      error.friendlyMessage = `Duplicate Tap: ${message}`;
    } else if (status === 401) {
      error.errorCode = 'ERROR_401';
      error.friendlyMessage = 'Unauthorized. Please log in again.';
    } else {
      error.errorCode = 'ERROR_UNKNOWN';
      error.friendlyMessage = message || 'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default api;
