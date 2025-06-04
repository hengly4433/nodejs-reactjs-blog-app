// src/services/api.ts
import axios from 'axios';

// Read from Vite’s env. If the variable is not defined, fall back to "http://localhost:4000"
const RAW_URL = import.meta.env.VITE_API_URL;
const BASE_URL = RAW_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token (if any) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers!['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
