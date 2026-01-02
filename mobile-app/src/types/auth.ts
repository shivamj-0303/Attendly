import { UserRole } from './common';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  userId: number;
  userRole: UserRole;
}

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface SignupResponse {
  message: string;
  token: string;
  userId: number;
  userRole: UserRole;
}

export interface User {
  email: string;
  id: number;
  name: string;
  role: UserRole;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: number | null;
  userRole: UserRole | null;
}
