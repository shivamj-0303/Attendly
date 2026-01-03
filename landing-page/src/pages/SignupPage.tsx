import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { FormInput, FormSection } from '@/components';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { ErrorResponse, SignupRequest } from '@/types';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;
const PHONE_PATTERN = /^[0-9]{10}$/;
const POSTAL_CODE_PATTERN = /^[0-9]{6}$/;

export default function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SignupRequest>();

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onError: (error: ErrorResponse) => {
      toast.error(error.message ?? 'Signup failed');
    },
    onSuccess: (data) => {
      setAuth(
        {
          email: data.email,
          id: data.id,
          name: data.name,
          phone: '',
          role: data.role,
        },
        data.token
      );
      toast.success('Account created successfully!');
      void navigate('/admin/dashboard');
    },
  });

  const onSubmit = (data: SignupRequest) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register Your Institution</h1>
          <p className="text-gray-600 mt-2">Create an admin account for your institution</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection title="Admin Details" showBorder>
            <FormInput
              error={errors.name}
              id="name"
              label="Full Name"
              placeholder="John Doe"
              register={register('name', {
                minLength: {
                  message: 'Name must be at least 2 characters',
                  value: 2,
                },
                required: 'Name is required',
              })}
              required
              type="text"
            />

            <FormInput
              error={errors.email}
              id="email"
              label="Email Address"
              placeholder="admin@example.com"
              register={register('email', {
                pattern: {
                  message: 'Invalid email address',
                  value: EMAIL_PATTERN,
                },
                required: 'Email is required',
              })}
              required
              type="email"
            />

            <FormInput
              error={errors.phone}
              id="phone"
              label="Phone Number"
              placeholder="1234567890"
              register={register('phone', {
                pattern: {
                  message: 'Phone must be 10 digits',
                  value: PHONE_PATTERN,
                },
                required: 'Phone is required',
              })}
              required
              type="tel"
            />

            <FormInput
              error={errors.password}
              id="password"
              label="Password"
              placeholder="Create a strong password"
              register={register('password', {
                minLength: {
                  message: 'Password must be at least 8 characters',
                  value: 8,
                },
                pattern: {
                  message:
                    'Password must contain uppercase, lowercase, number, and special character',
                  value: PASSWORD_PATTERN,
                },
                required: 'Password is required',
              })}
              required
              type="password"
            />
          </FormSection>

          <FormSection title="Institution Details">
            <FormInput
              error={errors.institution}
              id="institution"
              label="Institution Name"
              placeholder="ABC University"
              register={register('institution', {
                minLength: {
                  message: 'Institution name must be at least 3 characters',
                  value: 3,
                },
                required: 'Institution name is required',
              })}
              required
              type="text"
            />

            <FormInput
              error={errors.institutionEmail}
              id="institutionEmail"
              label="Institution Email"
              placeholder="info@abcuniversity.edu"
              register={register('institutionEmail', {
                pattern: {
                  message: 'Invalid email address',
                  value: EMAIL_PATTERN,
                },
                required: 'Institution email is required',
              })}
              required
              type="email"
            />

            <FormInput
              error={errors.institutionPhone}
              id="institutionPhone"
              label="Institution Phone"
              placeholder="9876543210"
              register={register('institutionPhone', {
                pattern: {
                  message: 'Phone must be 10 digits',
                  value: PHONE_PATTERN,
                },
                required: 'Institution phone is required',
              })}
              required
              type="tel"
            />

            <FormInput
              error={errors.institutionAddress}
              id="institutionAddress"
              label="Street Address"
              placeholder="123 Main Street"
              register={register('institutionAddress', {
                minLength: {
                  message: 'Address must be at least 5 characters',
                  value: 5,
                },
                required: 'Address is required',
              })}
              required
              type="text"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                error={errors.institutionCity}
                id="institutionCity"
                label="City"
                placeholder="Mumbai"
                register={register('institutionCity', {
                  minLength: {
                    message: 'City must be at least 2 characters',
                    value: 2,
                  },
                  required: 'City is required',
                })}
                required
                type="text"
              />

              <FormInput
                error={errors.institutionState}
                id="institutionState"
                label="State"
                placeholder="Maharashtra"
                register={register('institutionState', {
                  minLength: {
                    message: 'State must be at least 2 characters',
                    value: 2,
                  },
                  required: 'State is required',
                })}
                required
                type="text"
              />
            </div>

            <FormInput
              error={errors.institutionPostalCode}
              id="institutionPostalCode"
              label="Postal Code"
              placeholder="400001"
              register={register('institutionPostalCode', {
                pattern: {
                  message: 'Postal code must be 6 digits',
                  value: POSTAL_CODE_PATTERN,
                },
                required: 'Postal code is required',
              })}
              required
              type="text"
            />
          </FormSection>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {signupMutation.isPending ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
