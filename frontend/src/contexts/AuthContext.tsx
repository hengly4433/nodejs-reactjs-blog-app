// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import type { UserResponse } from '@/types';

// JWT payload type (from your JWT)
type JwtPayload = {
  id: string;
  username?: string;
  email?: string;
  exp: number;
  iat?: number;
};


type AuthContextType = {
  user: UserResponse | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // On mount, check localStorage for a JWT
  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      try {
        const payload = jwtDecode<JwtPayload>(saved);
        if (payload.exp * 1000 > Date.now()) {
          setToken(saved);
          setUser({
            id: payload.id,
            username: payload.username || '', // fallback if not in payload
            email: payload.email || '',
          });
          authService.setToken(saved);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
  
      // Validate and extract data from response
      const { token: newToken, user: userData } = await authService.login(email, password)
 
      if (!newToken || !userData) {
        throw new Error('Login failed: Missing token or user data');
      }

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      authService.setToken(newToken);
      navigate('/');
    } catch (err) {
      // You can show an error toast here if you have a notification system
      console.error('Login error:', err);
      throw err; // Re-throw to allow UI to display error if desired
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.register(username, email, password);
      const { token: newToken, user: userData } = response;
      if (!newToken || !userData) {
        throw new Error('Register failed: Missing token or user data');
      }
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      authService.setToken(newToken);
      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    authService.setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

