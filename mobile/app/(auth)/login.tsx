import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LoginInput } from '@/types';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { secureStorage } from '@/lib/secureStorage';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: '#0F1D3A',
  navyMid: '#162447',
  navyLight: '#1E3A6E',
  accent: '#4A90D9',
  accentBright: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  offWhite: '#F7F9FC',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(255,255,255,0.18)',
  placeholder: 'rgba(255,255,255,0.45)',
  textDim: 'rgba(255,255,255,0.65)',
  errorRed: '#FF6B6B',
};

// ── Clock display ─────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 400, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [time.getSeconds()]);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.clockWrap}>
      <View style={styles.clockRow}>
        <Animated.Text style={[styles.clockHM, { transform: [{ scale: pulse }] }]}>
          {hh}:{mm}
        </Animated.Text>
        <View style={styles.clockRight}>
          <Text style={styles.clockSS}>{ss}</Text>
          <Text style={styles.clockAMPM}>{ampm}</Text>
        </View>
      </View>
      <Text style={styles.clockDate}>{dateStr}</Text>
    </View>
  );
}

// ── Floating label input ───────────────────────────────────────────────────────
interface InputProps {
  label: string;
  icon: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur: () => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  error?: string;
}

function FloatInput({
  label, icon, value, onChangeText, onBlur,
  secureTextEntry = false, keyboardType, autoCapitalize, error,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.timing(labelAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur();
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    }
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [17, 2] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [C.placeholder, C.accentBright] });
  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [C.inputBorder, C.accentBright] });

  return (
    <View style={styles.inputWrap}>
      <Animated.View style={[styles.inputBox, { borderColor }, error ? { borderColor: C.errorRed } : {}]}>
        <Ionicons name={icon as any} size={18} color={focused ? C.accentBright : C.placeholder} style={styles.inputIcon} />
        <View style={styles.inputInner}>
          <Animated.Text style={[styles.floatLabel, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
            {label}
          </Animated.Text>
          <TextInput
            style={styles.inputText}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !visible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize ?? 'none'}
            placeholderTextColor="transparent"
          />
        </View>
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.eyeBtn}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.placeholder} />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={12} color={C.errorRed} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [apiError, setApiError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, delay: 100, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginInput>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setApiError(null);
      const res = await authApi.login(data);
      await secureStorage.setTokens(res.accessToken, res.refreshToken);
      setAuth(res.employee);
      if (res.employee.mustChangePassword) {
        router.replace('/(auth)/change-password');
      } else {
        router.replace(res.employee.role === 'EMPLOYEE' ? '/(employee)/' : '/(admin)/');
      }
    } catch (e: any) {
      setApiError(e.response?.data?.message || 'Incorrect email or password');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Gradient header ── */}
      <LinearGradient
        colors={[C.navy, C.navyMid, C.navyLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          {/* brand mark */}
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Ionicons name="time-outline" size={20} color={C.white} />
            </View>
            <Text style={styles.brandName}>TapIn</Text>
          </View>

          <LiveClock />

          <Text style={styles.tagline}>Your time, tracked fairly.</Text>
        </Animated.View>
      </LinearGradient>

      {/* ── White card body ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.cardOuter}
      >
        <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue</Text>

          {apiError && (
            <View style={styles.apiErrorBox}>
              <Ionicons name="warning-outline" size={14} color={C.errorRed} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email is required' }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <FloatInput
                label="Email address"
                icon="mail-outline"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password is required' }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <FloatInput
                label="Password"
                icon="lock-closed-outline"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                error={error?.message}
              />
            )}
          />

          <TouchableOpacity
            style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[C.accentBright, C.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtnGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color={C.white} style={{ marginLeft: 6 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Contact your HR admin if you need account access.
          </Text>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an organization? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Create one now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_RADIUS = 28;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.offWhite },
  header: { paddingTop: 60, paddingHorizontal: 28, paddingBottom: 48, overflow: 'hidden' },
  circle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.04)', top: -60, right: -60 },
  circle2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.04)', bottom: 10, left: -30 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  brandName: { fontSize: 18, fontWeight: '700', color: C.white, letterSpacing: 0.5 },
  clockWrap: { marginBottom: 12 },
  clockRow: { flexDirection: 'row', alignItems: 'flex-end' },
  clockHM: { fontSize: 54, fontWeight: '800', color: C.white, letterSpacing: -1, lineHeight: 58 },
  clockRight: { marginLeft: 8, marginBottom: 6 },
  clockSS: { fontSize: 22, fontWeight: '600', color: 'rgba(255,255,255,0.6)', lineHeight: 26 },
  clockAMPM: { fontSize: 14, fontWeight: '600', color: C.accentBright, lineHeight: 18 },
  clockDate: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4, letterSpacing: 0.3 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, fontStyle: 'italic' },
  cardOuter: { flex: 1, marginTop: -CARD_RADIUS },
  card: { flex: 1, backgroundColor: C.offWhite, borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 8 },
  cardTitle: { fontSize: 24, fontWeight: '800', color: C.navy, letterSpacing: -0.4 },
  cardSubtitle: { fontSize: 14, color: '#8A9BB5', marginTop: 4, marginBottom: 28 },
  apiErrorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F0', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 20, gap: 8, borderLeftWidth: 3, borderLeftColor: C.errorRed },
  apiErrorText: { fontSize: 13, color: C.errorRed, flex: 1 },
  inputWrap: { marginBottom: 16 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, minHeight: 58, shadowColor: '#0F1D3A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  inputIcon: { marginRight: 10, marginTop: 8 },
  inputInner: { flex: 1, paddingTop: 16 },
  floatLabel: { position: 'absolute', left: 0, color: '#A0AEC0' },
  inputText: { fontSize: 15, color: C.navy, paddingVertical: 4, fontWeight: '500' },
  eyeBtn: { padding: 6, marginTop: 8 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, marginLeft: 2 },
  errorText: { fontSize: 12, color: C.errorRed },
  loginBtn: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: C.white, letterSpacing: 0.3 },
  footerNote: { fontSize: 13, color: '#A0AEC0', textAlign: 'center', marginTop: 24, lineHeight: 18 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  registerText: { fontSize: 13, color: '#8A9BB5' },
  registerLink: { fontSize: 13, fontWeight: '700', color: C.teal, textDecorationLine: 'underline' },
});