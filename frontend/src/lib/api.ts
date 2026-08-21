import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { logger } from './logger';

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api/v1'
    : 'https://api.vitelo.me/api/v1');

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Automatically log API failures to backend telemetry (skip logging log endpoint itself to prevent loops)
    if (!error.config?.url?.includes('/logs')) {
      logger.error('AxiosAPI', `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} [${error.response?.status || 'Network Error'}]`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // 401 Unauthorized => logout
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    // 402 Payment Required => prompt pricing
    if (error.response?.status === 402) {
      alert("You need credits to unlock this feature.");
      window.location.href = '/dashboard-pricing'; 
    }
    return Promise.reject(error);
  }
);

