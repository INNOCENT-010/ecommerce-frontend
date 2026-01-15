// providers/authproviders.tsx - MINIMAL UPDATE
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  sendVerificationCode: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyCode: (email: string, code: string) => Promise<{ 
    success: boolean; 
    userExists?: boolean; 
    user?: User;
    message?: string;
  }>;
  completeRegistration: (email: string, full_name: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth data on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const sendVerificationCode = async (email: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'; // CHANGED HERE
      const response = await fetch(`${API_URL}/auth/send-verification`, { // CHANGED HERE
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, message: data.detail || 'Failed to send code' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const verifyCode = async (email: string, code: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'; // CHANGED HERE
      const response = await fetch(`${API_URL}/auth/verify-code`, { // CHANGED HERE
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          userExists: data.user_exists,
          user: data.user || null
        };
      } else {
        const data = await response.json();
        return { success: false, message: data.detail || 'Invalid code' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const completeRegistration = async (email: string, full_name: string, phone?: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'; // CHANGED HERE
      const response = await fetch(`${API_URL}/auth/magic-login`, { // CHANGED HERE
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name, phone }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token, data.user);
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, message: data.detail || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    sendVerificationCode,
    verifyCode,
    completeRegistration,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};