// User and Auth types
export type UserRole = 'admin' | 'teacher' | 'student';
export type UserType = 'student' | 'teacher';

export interface User {
  email: string;
  id: number;
  name: string;
  phone: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  institution: string;
  institutionAddress: string;
  institutionCity: string;
  institutionState: string;
  institutionPostalCode: string;
  institutionPhone: string;
  institutionEmail: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: string;
  message?: string;
}
