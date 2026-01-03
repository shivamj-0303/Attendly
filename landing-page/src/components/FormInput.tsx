import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  error?: FieldError;
  id: string;
  label: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  required?: boolean;
  type?: 'email' | 'password' | 'tel' | 'text';
}

export function FormInput({
  error,
  id,
  label,
  placeholder,
  register,
  required = false,
  type = 'text',
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...register}
        type={type}
        id={id}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
