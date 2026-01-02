import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService, AuthResponse } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, userType: 'student' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone: string,
    registrationNumber?: string
  ) => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, userType: 'student' | 'teacher') => {
    try {
      const response: AuthResponse = await authService.login({ email, password }, userType);
      const user = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      };
      setUser(user);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    registrationNumber?: string
  ) => {
    try {
      const response: AuthResponse = await authService.signup({
        email,
        name,
        password,
        phone,
        registrationNumber,
      });
      const user = {
        email: response.email,
        id: response.id,
        name: response.name,
        role: response.role,
      };
      setUser(user);
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
