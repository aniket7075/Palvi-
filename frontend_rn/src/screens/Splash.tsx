import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SplashNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashNavigationProp;
}

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.72;

export default function Splash({ navigation }: Props) {
  // Phase 1 – red background fills up
  const bgScale   = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  // Phase 2 – logo circle enters
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTransY  = useRef(new Animated.Value(60)).current;

  // Phase 3 – ring pulse
  const ringScale   = useRef(new Animated.Value(0.85)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  // Phase 4 – text & button slide up
  const contentTransY  = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Phase 1: BG circle expands
    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(bgScale, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
    ]).start(() => {
      // Phase 2: Ring pulse + logo bounce in together
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(logoTransY, {
          toValue: 0,
          friction: 6,
          tension: 55,
          useNativeDriver: true,
        }),
        // ring breathes in
        Animated.parallel([
          Animated.timing(ringOpacity, { toValue: 0.45, duration: 400, useNativeDriver: true }),
          Animated.spring(ringScale, { toValue: 1.18, friction: 4, tension: 30, useNativeDriver: true }),
        ]),
      ]).start(() => {
        // Ring fades out again (subtle pulse)
        Animated.timing(ringOpacity, { toValue: 0, duration: 600, useNativeDriver: true }).start();

        // Phase 3: text & button slide up
        Animated.parallel([
          Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(contentTransY, {
            toValue: 0,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#d5dddaff" />

      {/* ── Red background blob ─────────────────────────── */}
      <Animated.View
        style={[
          styles.redBlob,
          { opacity: bgOpacity, transform: [{ scale: bgScale }] },
        ]}
      />

      {/* ── Decorative corner circles ────────────────────── */}
      <View style={[styles.decorCircle, styles.topLeft]} />
      <View style={[styles.decorCircle, styles.bottomRight]} />

      {/* ── Logo area ───────────────────────────────────── */}
      <View style={styles.logoArea}>
        {/* Outer pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        />

        {/* White circle with logo */}
        <Animated.View
          style={[
            styles.logoCircle,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { translateY: logoTransY }],
            },
          ]}
        >
          <Image
            source={require('../palvi.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* ── Text + CTA ───────────────────────────────────── */}
      <Animated.View
        style={[
          styles.bottomContent,
          { opacity: contentOpacity, transform: [{ translateY: contentTransY }] },
        ]}
      >
        <Text style={styles.brandName}>Palvi Outlets</Text>
        <Text style={styles.tagline}>
          Premium hotel operations, staff attendance,{'\n'}inventory &amp; daily sales — all in one place.
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>PALVI HOTEL GROUP © 2026</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0ecff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Red background blob (huge circle) ── */
  redBlob: {
    position: 'absolute',
    top: -height * 0.18,
    alignSelf: 'center',
    width: width * 1.6,
    height: width * 1.6,
    borderRadius: width * 0.8,
    backgroundColor: '#0d4e37',
  },

  /* ── Decorative soft circles ── */
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#000000ff',
    opacity: 0.06,
  },
  topLeft: {
    width: 180,
    height: 180,
    top: -40,
    left: -60,
  },
  bottomRight: {
    width: 240,
    height: 240,
    bottom: 60,
    right: -90,
    backgroundColor: '#000000ff',
    opacity: 0.05,
  },

  /* ── Logo area ── */
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },

  /* Outer pulse ring */
  pulseRing: {
    position: 'absolute',
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    borderRadius: (CIRCLE_SIZE + 40) / 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },

  /* White logo circle */
  logoCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
  },

  logoImage: {
    width: CIRCLE_SIZE * 0.72,
    height: CIRCLE_SIZE * 0.72,
  },

  /* ── Bottom content ── */
  bottomContent: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    alignItems: 'center',
  },

  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0e0e0eff',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  tagline: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.85)',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },

  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    marginBottom: 24,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#146e4e',
    letterSpacing: 0.5,
  },

  footer: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(21, 21, 21, 0.6)',
    letterSpacing: 1.5,
  },
});
