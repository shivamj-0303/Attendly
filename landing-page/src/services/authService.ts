import api from '@/lib/api'
import type { LoginRequest, SignupRequest, AuthResponse } from '@/types/auth'

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  userLogin: async (email: string, password: string, userType: 'student' | 'teacher'): Promise<AuthResponse> => {
    const endpoint = userType === 'student' ? '/auth/user/student/login' : '/auth/user/teacher/login'
    const response = await api.post<AuthResponse>(endpoint, { email, password })
    return response.data
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}
