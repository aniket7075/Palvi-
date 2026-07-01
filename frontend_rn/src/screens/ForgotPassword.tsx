import React, { useState } from 'react';
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

type ForgotPasswordProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordProp;
}

export default function ForgotPassword({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    try {
      await api.post('/auth/forgot-password', { email: trimmedEmail });
      setSuccess('OTP verification code sent to your email.');
      await AsyncStorage.setItem('reset_email', trimmedEmail);
      setTimeout(() => {
        navigation.navigate('OtpVerification');
      }, 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to send OTP.';
      setError(typeof msg === 'string' ? msg : 'Failed to send OTP.');
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
          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←  Back to Login</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address below. We'll send you a 4-digit verification code to reset your password.
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
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. manager@gmail.com"
              placeholderTextColor="#8c6e65"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Send Verification Code</Text>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8c6e65',
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
