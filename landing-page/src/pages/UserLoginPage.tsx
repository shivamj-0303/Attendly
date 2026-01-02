import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { GraduationCap, UserCircle } from 'lucide-react'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

type UserLoginRequest = {
  email: string
  password: string
}

type UserType = 'student' | 'teacher'

export default function UserLoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { register, handleSubmit, formState: { errors } } = useForm<UserLoginRequest>()
  const [serverError, setServerError] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>('student')

  const loginMutation = useMutation({
    mutationFn: (data: UserLoginRequest & { userType: UserType }) => 
      authService.userLogin(data.email, data.password, data.userType),
    onSuccess: (data) => {
      setAuth(
        {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: '',
          role: data.role,
        },
        data.token,
      )
      toast.success('Login successful!')
      if (userType === 'student') {
        void navigate('/student/dashboard')
      } else {
        void navigate('/teacher/dashboard')
      }
    },
    onError: (error: unknown) => {
      const axiosErr = error as { response?: { status?: number; data?: { message?: string } } } | undefined
      const status = axiosErr?.response?.status
      const serverMsg = axiosErr?.response?.data?.message

      let userMessage = 'Login failed'
      if (status === 404) {
        userMessage = 'No account found with this email.'
      } else if (status === 401) {
        userMessage = 'Invalid email or password.'
      } else if (serverMsg) {
        userMessage = serverMsg
      }

      setServerError(userMessage)
    },
  })

  const onSubmit = (data: UserLoginRequest) => {
    setServerError(null)
    loginMutation.mutate({ ...data, userType })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            {userType === 'student' ? (
              <GraduationCap className="w-8 h-8 text-white" />
            ) : (
              <UserCircle className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userType === 'student' ? 'Student' : 'Teacher'} Login
          </h1>
          <p className="text-gray-600 mt-2">Sign in to access your portal</p>
        </div>

        {/* User Type Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'student'
                ? 'bg-white text-indigo-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserType('teacher')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'teacher'
                ? 'bg-white text-indigo-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={userType === 'student' ? 'student@example.com' : 'teacher@example.com'}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              {...register('password', {
                required: 'Password is required',
              })}
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>
          <Link
            to="/admin/login"
            className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Login as Institution Admin →
          </Link>
        </div>
      </div>
    </div>
  )
}
