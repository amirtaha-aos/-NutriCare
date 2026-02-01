import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

import { Platform } from 'react-native';

// For Android emulator use 10.0.2.2, for iOS simulator use localhost
// For real device, use your local network IP
const HOTSPOT_IP = '192.168.20.2'; // Laptop IP when connected via phone hotspot

const getBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api'; // Android emulator
    }
    return 'http://localhost:3000/api'; // iOS simulator
  }
  // Production - use hotspot IP for real device testing
  return `http://${HOTSPOT_IP}:3000/api`;
};

const API_BASE_URL = getBaseUrl();

console.log('API_BASE_URL:', API_BASE_URL);
console.log('__DEV__:', __DEV__);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await EncryptedStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await EncryptedStorage.getItem('refreshToken');

        if (!refreshToken) {
          await EncryptedStorage.clear();
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await EncryptedStorage.setItem('accessToken', accessToken);
        await EncryptedStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        await EncryptedStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
