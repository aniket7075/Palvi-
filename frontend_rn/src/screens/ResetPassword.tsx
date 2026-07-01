import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import api from '../api';

type ResetPasswordProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;

interface Props {
  navigation: ResetPasswordProp;
}

export default function ResetPassword({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    const loadResetEmail = async () => {
      const email = await AsyncStorage.getItem('reset_email');
      setResetEmail(email || 'admin@gmail.com');
    };
    loadResetEmail();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const code = await AsyncStorage.getItem('reset_token');
      await api.post('/auth/reset-password', {
        email: resetEmail,
        token: code || '',
        newPassword: password
      });

      setSuccess('Password reset successfully! Redirecting to login...');
      await AsyncStorage.removeItem('reset_email');
      await AsyncStorage.removeItem('reset_token');

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to update password.';
      setError(typeof msg === 'string' ? msg : 'Failed to update password.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Please enter your new password below. Make sure it is secure.
          </Text>

          {error ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successAlert}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Min 6 characters"
              placeholderTextColor="#8c6e65"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Repeat password"
              placeholderTextColor="#8c6e65"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#146e4e',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 24,
    elevation: 8,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#8c6e65',
    lineHeight: 18,
    marginBottom: 24,
  },
  errorAlert: {
    width: '100%',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successAlert: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#146e4e',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d251e',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#3d251e',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  submitButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
