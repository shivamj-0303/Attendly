import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FormInput } from '../components';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type Step = 'email' | 'reset';
type UserType = 'STUDENT' | 'TEACHER';

export default function PasswordResetScreen({ navigation }: any) {
  const { logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userType, setUserType] = useState<UserType>('STUDENT');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/user/request-password-reset', {
        email: email.trim().toLowerCase(),
        userType,
      });

      setMaskedEmail(response.data.email || email);
      setCurrentStep('reset');
      Alert.alert('Success', 'OTP sent to your registered email address. Please check your email and enter the OTP below.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP code');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/user/reset-password', {
        newPassword,
        otpCode: otpCode.trim(),
      });

      Alert.alert('Success', 'Password reset successfully! Please login with your new password.', [
        {
          onPress: async () => {
            await logout();
            // After logout, the app will automatically redirect to AuthNavigator (Login screen)
            // No need to explicitly navigate
          },
          text: 'OK',
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP or failed to reset password';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View
          style={[
            styles.stepCircle,
            currentStep === 'email' && styles.stepCircleActive,
            currentStep === 'reset' && styles.stepCircleCompleted,
          ]}
        >
          <Text
            style={[
              styles.stepNumber,
              (currentStep === 'email' || currentStep === 'reset') && styles.stepNumberActive,
            ]}
          >
            1
          </Text>
        </View>
        <Text style={styles.stepLabel}>Email</Text>
      </View>

      <View style={[styles.stepLine, currentStep === 'reset' && styles.stepLineCompleted]} />

      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep === 'reset' && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep === 'reset' && styles.stepNumberActive]}>
            2
          </Text>
        </View>
        <Text style={styles.stepLabel}>Reset</Text>
      </View>
    </View>
  );

  const renderEmailStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Reset Password</Text>
      <Text style={styles.stepDescription}>
        Enter your registered email address to receive an OTP code
      </Text>

      <View style={styles.userTypeContainer}>
        <TouchableOpacity
          onPress={() => setUserType('STUDENT')}
          style={[styles.userTypeButton, userType === 'STUDENT' && styles.userTypeButtonActive]}
        >
          <Text
            style={[styles.userTypeText, userType === 'STUDENT' && styles.userTypeTextActive]}
          >
            Student
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setUserType('TEACHER')}
          style={[styles.userTypeButton, userType === 'TEACHER' && styles.userTypeButtonActive]}
        >
          <Text
            style={[styles.userTypeText, userType === 'TEACHER' && styles.userTypeTextActive]}
          >
            Teacher
          </Text>
        </TouchableOpacity>
      </View>

      <FormInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        label="Email Address"
        onChangeText={setEmail}
        placeholder="Enter your email"
        value={email}
      />

      <TouchableOpacity
        disabled={isLoading}
        onPress={handleRequestOTP}
        style={[styles.button, isLoading && styles.buttonDisabled]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderOTPStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Enter OTP & New Password</Text>
      <Text style={styles.stepDescription}>
        We've sent a 6-digit code to {maskedEmail}. Enter it below along with your new password.
      </Text>

      <FormInput
        keyboardType="number-pad"
        label="OTP Code"
        maxLength={6}
        onChangeText={setOtpCode}
        placeholder="Enter 6-digit code"
        value={otpCode}
      />

      <FormInput
        autoCapitalize="none"
        label="New Password"
        onChangeText={setNewPassword}
        placeholder="Enter new password (min 6 characters)"
        secureTextEntry
        value={newPassword}
      />

      <FormInput
        autoCapitalize="none"
        label="Confirm Password"
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
      />

      <TouchableOpacity
        disabled={isLoading}
        onPress={handleResetPassword}
        style={[styles.button, isLoading && styles.buttonDisabled]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        disabled={isLoading}
        onPress={handleRequestOTP}
        style={styles.resendButton}
      >
        <Text style={styles.resendText}>Didn't receive code? Resend</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🔐</Text>
            </View>
            <Text style={styles.title}>Password Reset</Text>
          </View>

          {renderStepIndicator()}

          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'reset' && renderOTPStep()}

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginTop: 20,
  },
  backText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  iconText: {
    fontSize: 40,
  },
  resendButton: {
    marginTop: 16,
  },
  resendText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepCircle: {
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  stepCircleActive: {
    backgroundColor: '#10b981',
  },
  stepCircleCompleted: {
    backgroundColor: '#059669',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepContent: {
    marginTop: 32,
  },
  stepDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  stepLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  stepLine: {
    backgroundColor: '#e5e7eb',
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: '#059669',
  },
  stepNumber: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  userTypeButton: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    paddingVertical: 12,
  },
  userTypeButtonActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  userTypeText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  userTypeTextActive: {
    color: '#10b981',
  },
});
