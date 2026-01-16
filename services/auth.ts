// services/auth.ts - FIXED VERSION
import { api, UserInfo } from '@/lib/api'; // Import UserInfo

interface LoginCredentials {
  email: string;
  password: string;
}

// Update Token interface to match what api.login() actually returns
interface Token {
  access_token: string;
  token_type: string;
  user: UserInfo; // Use UserInfo type instead of custom one
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<Token> {
    return await api.login(credentials.email, credentials.password);
  },

  async adminLogin(credentials: LoginCredentials): Promise<Token> {
    return await api.adminLogin(credentials.email, credentials.password);
  },

  async getCurrentUser(): Promise<UserInfo> { // Add return type
    return await api.getCurrentUser();
  },

  async logout(): Promise<void> { // Add return type
    await api.logout();
  },
};