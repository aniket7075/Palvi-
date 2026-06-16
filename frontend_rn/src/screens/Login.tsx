import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.46;
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { stateService } from '../services/stateService';
import api from '../api';

type LoginNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginNavigationProp;
}

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const scaleAnim  = useRef(new Animated.Value(0.3)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const transYAnim = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(transYAnim, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1. Attempt backend authentication
      const response = await api.post('/auth/login', { email, password });
      const session = response.data;

      await AsyncStorage.setItem('token', session.accessToken);
      await AsyncStorage.setItem('email', session.email);
      await AsyncStorage.setItem('fullName', session.fullName);
      await AsyncStorage.setItem('role', session.role);

      if (session.outletId) {
        await AsyncStorage.setItem('outletId', session.outletId.toString());
        await AsyncStorage.setItem('outletName', session.outletName);
      } else {
        await AsyncStorage.removeItem('outletId');
        await AsyncStorage.removeItem('outletName');
      }

      let targetScreen = 'ManagerDashboard';
      if (session.role === 'ADMIN') targetScreen = 'AdminDashboard';
      if (session.role === 'INVENTORY_MANAGER') targetScreen = 'GodownDispatchScreen';
      navigation.reset({
        index: 0,
        routes: [{ name: targetScreen, params: { user: session } }],
      });
    } catch (err: any) {
      // 2. Network error fallback to offline stateService
      if (err.code === 'ERR_NETWORK' || !err.response) {
        console.warn('Backend offline. Falling back to mock authentication.');
        try {
          const session = stateService.login(email, password);
          await AsyncStorage.setItem('token', session.token);
          await AsyncStorage.setItem('email', session.email);
          await AsyncStorage.setItem('fullName', session.fullName);
          await AsyncStorage.setItem('role', session.role);

          if (session.outletId) {
            await AsyncStorage.setItem('outletId', session.outletId.toString());
            await AsyncStorage.setItem('outletName', session.outletName);
          } else {
            await AsyncStorage.removeItem('outletId');
            await AsyncStorage.removeItem('outletName');
          }

          let targetScreen = 'ManagerDashboard';
          if (session.role === 'ADMIN') targetScreen = 'AdminDashboard';
          if (session.role === 'INVENTORY_MANAGER') targetScreen = 'GodownDispatchScreen';
          navigation.reset({
            index: 0,
            routes: [{ name: targetScreen as any, params: { user: session } }],
          });
          return;
        } catch (mockErr: any) {
          setError(mockErr.message || 'Login failed.');
          return;
        }
      }

      const errMsg = err.response?.data?.message || err.message || 'Login failed.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#146e4e" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Background shapes */}
        <View style={[styles.circle, styles.topCircle]} />
        <View style={[styles.circle, styles.bottomCircle]} />

        {/* Big logo ABOVE card */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: transYAnim }],
            },
          ]}
        >
          <Image source={require('../palvi.png')} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to manage hotel operations and inventory.</Text>

          {error ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. admin@gmail.com"
              placeholderTextColor="#8c6e65"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#8c6e65"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.showButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
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
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  topCircle: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    opacity: 0.05,
    top: -50,
    right: -50,
  },
  bottomCircle: {
    width: 300,
    height: 300,
    backgroundColor: '#ffffff',
    opacity: 0.04,
    bottom: -100,
    left: -100,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    elevation: 16,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    borderWidth: 2.5,
    borderColor: '#bbf7d0',
  },
  logoImage: {
    width: LOGO_SIZE * 0.72,
    height: LOGO_SIZE * 0.72,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8c6e65',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  errorAlert: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#0d4e37',
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
    marginTop: 12,
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
  },
  passwordInputContainer: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#3d251e',
  },
  showButton: {
    padding: 4,
  },
  showText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#146e4e',
  },
  loginButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
