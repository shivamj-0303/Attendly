import { useState } from 'react';
import { Alert } from 'react-native';

interface ValidationRules {
  confirmPassword?: string;
  email?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  phone?: boolean;
  required?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (
    fieldName: string,
    value: string,
    rules: ValidationRules
  ): string | null => {
    if (rules.required && !value) {
      return `${fieldName} is required`;
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must be at most ${rules.maxLength} characters`;
    }

    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (rules.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value)) {
        return 'Phone number must be exactly 10 digits';
      }
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }

    if (rules.confirmPassword && value !== rules.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const validateForm = (fields: { [key: string]: { rules: ValidationRules; value: string } }): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.entries(fields).forEach(([fieldName, { rules, value }]) => {
      const error = validateField(fieldName, value, rules);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      Alert.alert('Validation Error', firstError);
    }

    return isValid;
  };

  const clearError = (fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    clearAllErrors,
    clearError,
    errors,
    validateForm,
  };
};
