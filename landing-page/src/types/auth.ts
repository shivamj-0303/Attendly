export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  phone: string
}

export interface AuthResponse {
  token: string
  type: string
  id: number
  name: string
  email: string
  role: string
  message?: string
}
