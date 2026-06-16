import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:8080/api'; // Local backend for Android Emulator

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('email');
        await AsyncStorage.removeItem('role');
      } catch (e) {
        // Ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
