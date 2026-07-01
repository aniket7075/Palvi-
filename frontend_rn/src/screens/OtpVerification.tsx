import React, { useState, useRef, useEffect } from 'react';
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

type OtpVerificationProp = StackNavigationProp<RootStackParamList, 'OtpVerification'>;

interface Props {
  navigation: OtpVerificationProp;
}

export default function OtpVerification({ navigation }: Props) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const input1 = useRef<TextInput>(null);
  const input2 = useRef<TextInput>(null);
  const input3 = useRef<TextInput>(null);
  const input4 = useRef<TextInput>(null);
  const inputs = [input1, input2, input3, input4];

  useEffect(() => {
    const loadResetEmail = async () => {
      const email = await AsyncStorage.getItem('reset_email');
      setResetEmail(email || 'your email');
    };
    loadResetEmail();

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    // Keep numbers only
    const cleanText = text.replace(/[^0-9]/g, '');
    if (!cleanText && text) return;

    const newOtp = [...otp];
    newOtp[index] = cleanText.substring(cleanText.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanText && index < 3) {
      inputs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputs[index - 1].current?.focus();
      }
    }
  };

  const handleVerify = async () => {
    setError('');
    setSuccess('');
    const code = otp.join('');

    if (code.length < 4) {
      setError('Please enter all 4 digits of the code.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { email: resetEmail, token: code });
      await AsyncStorage.setItem('reset_token', code);
      setSuccess('Code verified successfully.');
      setTimeout(() => {
        navigation.navigate('ResetPassword');
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Incorrect verification code.';
      setError(typeof msg === 'string' ? msg : 'Incorrect verification code.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(['', '', '', '']);
    setTimer(59);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      setSuccess('A new verification code has been sent.');
      inputs[0].current?.focus();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to resend code.';
      setError(typeof msg === 'string' ? msg : 'Failed to resend code.');
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
            <Text style={styles.backButtonText}>←  Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Verify Code</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code sent to <Text style={styles.boldText}>{resetEmail}</Text>. (Use code <Text style={styles.primaryText}>1234</Text> to verify)
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

          {/* 4 Inputs */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={inputs[idx]}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Timer and Resend */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend now</Text>
              </TouchableOpacity>
            )}
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
  boldText: {
    color: '#3d251e',
    fontWeight: '800',
  },
  primaryText: {
    color: '#146e4e',
    fontWeight: '800',
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    color: '#3d251e',
    fontSize: 20,
    fontWeight: '800',
  },
  verifyButton: {
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
    marginBottom: 20,
  },
  verifyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    fontSize: 13,
    color: '#8c6e65',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 13,
    color: '#3d251e',
    fontWeight: '800',
  },
  resendLink: {
    fontSize: 13,
    color: '#146e4e',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
