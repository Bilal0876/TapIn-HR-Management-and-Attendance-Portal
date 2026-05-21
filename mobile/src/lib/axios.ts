import axios from 'axios';
import { secureStorage } from './secureStorage';
import { router } from 'expo-router';
import { useAuthStore } from '@/features/auth/store';

// In development, this naturally maps to local IPs, for simplicity:
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!config.url?.includes('/auth/login')) {
    // If no token and not logging in, cancel the request to prevent 401 flood
    const controller = new AbortController();
    config.signal = controller.signal;
    controller.abort('No auth token available');
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data?.code === 'MUST_CHANGE_PASSWORD') {
      router.replace('/(auth)/change-password');
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      await secureStorage.clearTokens();
      useAuthStore.getState().clearAuth();
      router.replace('/(auth)/login');
    }
    
    return Promise.reject(error);
  }
);
