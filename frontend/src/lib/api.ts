import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
    // 401 Unauthorized => logout
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    // 402 Payment Required => prompt pricing
    if (error.response?.status === 402) {
      // Custom event or logic to show pricing
      alert("You need credits to unlock this feature.");
      window.location.href = '/dashboard'; 
    }
    return Promise.reject(error);
  }
);
