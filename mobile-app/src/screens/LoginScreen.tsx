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
import { useTheme } from '../context/ThemeContext';
import { useFormValidation } from '../hooks/useFormValidation';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const { errors, validateForm } = useFormValidation();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');

  const styles = getStyles(theme);

  const handleLogin = async () => {
    const isValid = validateForm({
      Email: {
        rules: { email: true, required: true },
        value: email,
      },
      Password: {
        rules: { required: true },
        value: password,
      },
    });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, userType);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message ?? 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Smart Attendance Management</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Login as</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                onPress={() => setUserType('student')}
                style={[
                  styles.userTypeButton,
                  userType === 'student' && styles.userTypeButtonActive,
                ]}
              >
                <Text
                  style={[styles.userTypeText, userType === 'student' && styles.userTypeTextActive]}
                >
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUserType('teacher')}
                style={[
                  styles.userTypeButton,
                  userType === 'teacher' && styles.userTypeButtonActive,
                ]}
              >
                <Text
                  style={[styles.userTypeText, userType === 'teacher' && styles.userTypeTextActive]}
                >
                  Teacher
                </Text>
              </TouchableOpacity>
            </View>

            <FormInput
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.Email}
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="Enter your email"
              value={email}
            />

            <FormInput
              autoCapitalize="none"
              error={errors.Password}
              label="Password"
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
            />

            <TouchableOpacity
              disabled={isLoading}
              onPress={handleLogin}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('PasswordReset')}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.link}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    marginTop: 8,
    padding: 16,
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
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 20,
    width: 80,
  },
  iconText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  label: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  link: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userTypeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    flex: 1,
    paddingVertical: 12,
  },
  userTypeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  userTypeContainer: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 20,
    overflow: 'hidden',
  },
  userTypeText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  userTypeTextActive: {
    color: '#fff',
  },
});
