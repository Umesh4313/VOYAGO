/// <reference types="vite/client" />
import apiClient from './api';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  partnerStatus?: User['partnerStatus'];
  phone?: string;
  city?: string;
  state?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  city: string;
  state: string;
  partnerBusinessName?: string;
}

export interface PasswordResetResponse {
  message: string;
  resetUrl?: string;
}

const TOKEN_KEY = 'voyago_token';
const USER_KEY = 'voyago_user';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      partnerStatus: data.partnerStatus,
      phone: data.phone,
      city: data.city,
      state: data.state,
    }));
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      partnerStatus: data.partnerStatus,
      phone: data.phone,
      city: data.city,
      state: data.state,
    }));
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    const { data } = await apiClient.post<PasswordResetResponse>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<PasswordResetResponse> {
    const { data } = await apiClient.post<PasswordResetResponse>('/auth/reset-password', { token, password });
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
