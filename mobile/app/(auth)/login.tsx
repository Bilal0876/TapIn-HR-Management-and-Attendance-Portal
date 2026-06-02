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
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.timing(labelAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur();
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    }
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 8] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = labelAnim.interpolate({ inputRange: [0, 1], outputRange: ['#A0AEC0', C.accentBright] });
  const borderColor = error
    ? C.errorRed
    : borderAnim.interpolate({ inputRange: [0, 1], outputRange: ['#E8EDF5', C.accentBright] });
  const shadowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] });

  const filled = !!value;

  return (
    <View style={styles.inputWrap}>
      {/* Glow behind the input when focused */}
      <Animated.View style={[styles.inputGlow, { opacity: shadowOpacity }]} />

      <Animated.View style={[
        styles.inputBox,
        { borderColor },
        focused && styles.inputBoxFocused,
      ]}>
        {/* Left icon strip */}
        <View style={[styles.inputIconStrip, focused && styles.inputIconStripActive]}>
          <Ionicons
            name={icon as any}
            size={18}
            color={focused ? C.accentBright : '#A0AEC0'}
          />
        </View>

        <View style={styles.inputInner}>
          {/* Always-visible floating label */}
          <Animated.Text style={[
            styles.floatLabel,
            { top: labelTop, fontSize: labelSize, color: labelColor },
          ]}>
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
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={focused ? C.accentBright : '#A0AEC0'}
            />
          </TouchableOpacity>
        )}

        {/* Filled checkmark indicator */}
        {filled && !secureTextEntry && !error && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={11} color={C.white} />
          </View>
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
      setAuth(res.employee, res.accessToken, res.refreshToken);
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
        {/* Decorative orbs */}
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={styles.orb3} />

        {/* Subtle grid lines */}
        <View style={styles.gridLines} pointerEvents="none">
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.gridLine, { top: 30 + i * 38 }]} />
          ))}
        </View>

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          {/* Brand */}
          <View style={styles.brandRow}>
            <LinearGradient
              colors={[C.accentBright, C.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Ionicons name="time-outline" size={18} color={C.white} />
            </LinearGradient>
            <Text style={styles.brandName}>TapIn</Text>
          </View>
          <LiveClock />

          {/* Stat pills row */}
          <View style={styles.statRow}>
            <View style={styles.statPill}>
              <Ionicons name="people-outline" size={13} color={C.accentBright} />
              <Text style={styles.statText}>HR Portal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Ionicons name="shield-checkmark-outline" size={13} color={C.teal} />
              <Text style={styles.statText}>Secure Login</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── White card body ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.cardOuter}
      >
        <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Card top accent bar */}
          <LinearGradient
            colors={[C.accentBright, C.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardAccentBar}
          />

          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardSubtitle}>Sign in to continue to your workspace</Text>
            </View>
            <View style={styles.cardAvatarRing}>
              <LinearGradient
                colors={[C.accentBright, C.teal]}
                style={styles.cardAvatar}
              >
                <Ionicons name="person-outline" size={20} color={C.white} />
              </LinearGradient>
            </View>
          </View>

          {apiError && (
            <View style={styles.apiErrorBox}>
              <Ionicons name="warning-outline" size={14} color={C.errorRed} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          )}

          {/* Inputs section */}
          <View style={styles.inputsCard}>
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

            <View style={styles.inputSeparator}>
              <View style={styles.inputSepLine} />
              <Ionicons name="lock-closed-outline" size={12} color="#C5CDD8" style={{ marginHorizontal: 8 }} />
              <View style={styles.inputSepLine} />
            </View>

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
          </View>

          {/* Sign in button */}
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
                <View style={styles.loginBtnInner}>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <View style={styles.loginBtnArrow}>
                    <Ionicons name="arrow-forward" size={16} color={C.accentBright} />
                  </View>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Ionicons name="information-circle-outline" size={13} color="#B0BAC8" />
            <Text style={styles.footerNote}>Contact your HR admin if you need account access.</Text>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>New organization? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Create one now →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_RADIUS = 32;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.offWhite },

  // ── Header
  header: {
    paddingTop: 56,
    paddingHorizontal: 28,
    paddingBottom: 52,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(91,163,245,0.08)', top: -80, right: -60,
  },
  orb2: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(29,184,160,0.07)', bottom: -20, left: -40,
  },
  orb3: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)', top: 40, right: 80,
  },
  gridLines: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  gridLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoBox: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  brandName: { fontSize: 17, fontWeight: '700', color: C.white, letterSpacing: 0.5, flex: 1 },
  livePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(29,184,160,0.18)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    gap: 4,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.teal },
  liveText: { fontSize: 10, fontWeight: '700', color: C.teal, letterSpacing: 1 },

  // Clock
  clockWrap: { marginBottom: 16 },
  clockRow: { flexDirection: 'row', alignItems: 'flex-end' },
  clockHM: { fontSize: 52, fontWeight: '800', color: C.white, letterSpacing: -1, lineHeight: 56 },
  clockRight: { marginLeft: 8, marginBottom: 5 },
  clockSS: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.55)', lineHeight: 24 },
  clockAMPM: { fontSize: 13, fontWeight: '700', color: C.accentBright, lineHeight: 18 },
  clockDate: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3, letterSpacing: 0.3 },

  // Stat row
  statRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14,
    alignSelf: 'flex-start', marginTop: 4,
  },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  statDivider: { width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 12 },

  // ── Card
  cardOuter: { flex: 1, marginTop: -CARD_RADIUS },
  card: {
    flex: 1,
    backgroundColor: C.offWhite,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    paddingHorizontal: 24,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  cardAccentBar: {
    height: 3,
    width: 56,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 24,
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 26, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  cardSubtitle: { fontSize: 13, color: '#8A9BB5', marginTop: 4, lineHeight: 18 },
  cardAvatarRing: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, borderColor: 'rgba(91,163,245,0.25)',
    padding: 2,
  },
  cardAvatar: { flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  // Error
  apiErrorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F0', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: 16, gap: 8,
    borderLeftWidth: 3, borderLeftColor: C.errorRed,
  },
  apiErrorText: { fontSize: 13, color: C.errorRed, flex: 1 },

  // Inputs grouped card
  inputsCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  inputSeparator: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 2,
  },
  inputSepLine: { flex: 1, height: 1, backgroundColor: '#F0F3F8' },

  // Float input
  inputWrap: { marginVertical: 6 },
  inputGlow: {
    position: 'absolute',
    top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 18,
    backgroundColor: C.accentBright,
    zIndex: -1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 0,
    borderRadius: 12,
    minHeight: 62,
    overflow: 'hidden',
  },
  inputBoxFocused: {
    backgroundColor: '#F8FBFF',
  },
  inputIconStrip: {
    width: 44, alignSelf: 'stretch',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F6F9FD',
    borderRightWidth: 1,
    borderRightColor: '#EEF2F8',
    marginRight: 12,
  },
  inputIconStripActive: {
    backgroundColor: '#EEF6FF',
    borderRightColor: 'rgba(91,163,245,0.25)',
  },
  inputInner: { flex: 1, paddingTop: 18, paddingRight: 4 },
  floatLabel: { position: 'absolute', left: 0 },
  inputText: {
    fontSize: 15, color: C.navy,
    paddingVertical: 2, fontWeight: '500',
  },
  eyeBtn: { padding: 12, alignSelf: 'stretch', justifyContent: 'center' },
  checkBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.teal,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginLeft: 2 },
  errorText: { fontSize: 12, color: C.errorRed },

  // Button
  loginBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGradient: { paddingVertical: 16, paddingHorizontal: 24 },
  loginBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: C.white, letterSpacing: 0.4 },
  loginBtnArrow: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.white,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 10,
  },

  // Footer
  footerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginTop: 20,
  },
  footerNote: { fontSize: 12, color: '#A0AEC0', textAlign: 'center', lineHeight: 18 },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 16, gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8EDF5' },
  dividerText: { fontSize: 12, color: '#B0BAC8', fontWeight: '500' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 13, color: '#8A9BB5' },
  registerLink: { fontSize: 13, fontWeight: '700', color: C.teal },
});