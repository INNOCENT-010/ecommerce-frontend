// services/auth.ts
import { api } from '@/lib/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface Token {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    is_admin: boolean;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<Token> {
    const response = await api.post<Token>('/api/auth/login', credentials);
    return response.data;
  },

  async adminLogin(credentials: LoginCredentials): Promise<Token> {
    const response = await api.post<Token>('/api/auth/admin-login', credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};
