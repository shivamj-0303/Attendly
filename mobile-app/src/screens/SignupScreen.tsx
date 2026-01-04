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

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth();
  const { theme } = useTheme();
  const { errors, validateForm } = useFormValidation();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');

  const styles = getStyles(theme);

  const handleSignup = async () => {
    const isValid = validateForm({
      'Confirm Password': {
        rules: { confirmPassword: password, required: true },
        value: confirmPassword,
      },
      Email: {
        rules: { email: true, required: true },
        value: email,
      },
      Name: {
        rules: { required: true },
        value: name,
      },
      Password: {
        rules: {
          minLength: 8,
          pattern: PASSWORD_REGEX,
          required: true,
        },
        value: password,
      },
      Phone: {
        rules: { phone: true, required: true },
        value: phone,
      },
    });

    if (!isValid) {
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      Alert.alert(
        'Invalid Password',
        'Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character'
      );
      return;
    }

    setIsLoading(true);
    try {
      await signup(name, email, password, phone, registrationNumber);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message ?? 'Failed to create account');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Attendly today</Text>
          </View>

          <View style={styles.form}>
            <FormInput
              autoCapitalize="words"
              error={errors.Name}
              label="Full Name"
              onChangeText={setName}
              placeholder="Enter your full name"
              value={name}
            />

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
              error={errors.Phone}
              keyboardType="phone-pad"
              label="Phone Number"
              maxLength={10}
              onChangeText={setPhone}
              placeholder="Enter your 10-digit phone number"
              value={phone}
            />

            <FormInput
              autoCapitalize="characters"
              error={errors['Registration Number']}
              label="Registration Number (Optional)"
              onChangeText={setRegistrationNumber}
              placeholder="Enter your registration number"
              value={registrationNumber}
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

            <FormInput
              autoCapitalize="none"
              error={errors['Confirm Password']}
              label="Confirm Password"
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              value={confirmPassword}
            />

            <TouchableOpacity
              disabled={isLoading}
              onPress={handleSignup}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Login</Text>
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
});
