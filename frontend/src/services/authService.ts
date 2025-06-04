import api from './api';
import { AuthResponse } from '@/types';
import type { AuthApiEnvelope } from '@/types';

const authService = {
  setToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', { username, email, password });
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthApiEnvelope>('/auth/login', { email, password });
    return res.data.data;  // <--- Just return the inner { token, user }
  },
};

export default authService;
