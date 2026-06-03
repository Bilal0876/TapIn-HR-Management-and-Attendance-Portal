import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, KeyboardAvoidingView,
  Platform, StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { secureStorage } from '@/lib/secureStorage';
import { router } from 'expo-router';

// ── Design tokens (identical to login) ───────────────────────────────────────
const C = {
  navy: '#0F1D3A',
  navyMid: '#162447',
  navyLight: '#1E3A6E',
  accent: '#4A90D9',
  accentBright: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  offWhite: '#F7F9FC',
  inputBorder: 'rgba(255,255,255,0.18)',
  placeholder: 'rgba(255,255,255,0.45)',
  errorRed: '#FF6B6B',
};

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    key: 'company',
    title: 'Your Organization',
    subtitle: 'Tell us about your company',
    icon: 'business-outline',
    fields: ['companyName', 'timezone'],
  },
  {
    key: 'admin',
    title: 'Admin Account',
    subtitle: 'You will manage everything from here',
    icon: 'person-circle-outline',
    fields: ['adminName', 'adminEmail', 'adminPassword'],
  },
];

// ── Floating label input (matches login exactly) ──────────────────────────────
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

  return (
    <View style={styles.inputWrap}>
      <Animated.View style={[styles.inputBox, { borderColor }, focused && styles.inputBoxFocused]}>
        <View style={[styles.inputIconStrip, focused && styles.inputIconStripActive]}>
          <Ionicons name={icon as any} size={18} color={focused ? C.accentBright : '#A0AEC0'} />
        </View>
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
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={focused ? C.accentBright : '#A0AEC0'} />
          </TouchableOpacity>
        )}
        {!!value && !secureTextEntry && !error && (
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

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <View style={[
              styles.stepDot,
              done && styles.stepDotDone,
              active && styles.stepDotActive,
            ]}>
              {done
                ? <Ionicons name="checkmark" size={10} color={C.white} />
                : <Text style={[styles.stepDotText, active && { color: C.white }]}>{i + 1}</Text>
              }
            </View>
            {i < total - 1 && (
              <View style={[styles.stepLine, done && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, delay: 100, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateStep = () => {
    stepAnim.setValue(30);
    Animated.timing(stepAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const { control, handleSubmit, trigger, formState: { isSubmitting } } = useForm<any>({
    defaultValues: { companyName: '', timezone: 'UTC', adminName: '', adminEmail: '', adminPassword: '' },
  });

  const handleNext = async () => {
    const fields = STEPS[step].fields as any[];
    const valid = await trigger(fields);
    if (valid) {
      animateStep();
      setStep(1);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setApiError(null);
      const res = await authApi.registerCompany(data);
      await secureStorage.setTokens(res.accessToken, res.refreshToken);
      setAuth(res.employee, res.accessToken, res.refreshToken);
      router.replace('/(admin)/');
    } catch (e: any) {
      setApiError(e.response?.data?.message || 'Failed to register. Please try again.');
    }
  };

  const currentStep = STEPS[step];

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
          {/* Brand row */}
          <View style={styles.brandRow}>
            <LinearGradient colors={[C.accentBright, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
              <Ionicons name="time-outline" size={18} color={C.white} />
            </LinearGradient>
            <Text style={styles.brandName}>TapIn</Text>
          </View>

          {/* Hero text */}
          <Text style={styles.heroText}>Set up your{'\n'}workspace.</Text>
          <Text style={styles.tagline}>Ready in under 2 minutes.</Text>

          {/* Step pills */}
          <View style={styles.statRow}>
            <View style={styles.statPill}>
              <Ionicons name={currentStep.icon as any} size={13} color={C.accentBright} />
              <Text style={styles.statText}>{currentStep.subtitle}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Ionicons name="shield-checkmark-outline" size={13} color={C.teal} />
              <Text style={styles.statText}>Step {step + 1} of {STEPS.length}</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── White card body ── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.cardOuter}>
        <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Card top accent bar */}
          <LinearGradient
            colors={[C.accentBright, C.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardAccentBar}
          />

          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{currentStep.title}</Text>
              <Text style={styles.cardSubtitle}>{currentStep.subtitle}</Text>
            </View>
            <View style={styles.cardAvatarRing}>
              <LinearGradient colors={[C.accentBright, C.teal]} style={styles.cardAvatar}>
                <Ionicons name={currentStep.icon as any} size={20} color={C.white} />
              </LinearGradient>
            </View>
          </View>

          {/* Step indicator */}
          <StepIndicator current={step} total={STEPS.length} />

          {/* API Error */}
          {apiError && (
            <View style={styles.apiErrorBox}>
              <Ionicons name="warning-outline" size={14} color={C.errorRed} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          )}

          {/* Inputs card */}
          <Animated.View style={[styles.inputsCard, { transform: [{ translateY: stepAnim }] }]}>
            {step === 0 && (
              <>
                <Controller
                  control={control}
                  name="companyName"
                  rules={{ required: 'Company name is required' }}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <FloatInput label="Company Name" icon="business-outline" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="words" error={error?.message} />
                  )}
                />
                <View style={styles.inputSeparator}>
                  <View style={styles.inputSepLine} />
                  <Ionicons name="globe-outline" size={12} color="#C5CDD8" style={{ marginHorizontal: 8 }} />
                  <View style={styles.inputSepLine} />
                </View>
                <Controller
                  control={control}
                  name="timezone"
                  rules={{ required: 'Timezone is required' }}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <FloatInput label="Timezone (e.g. UTC, America/New_York)" icon="globe-outline" value={value} onChangeText={onChange} onBlur={onBlur} error={error?.message} />
                  )}
                />
              </>
            )}

            {step === 1 && (
              <>
                <Controller
                  control={control}
                  name="adminName"
                  rules={{ required: 'Your name is required' }}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <FloatInput label="Full Name" icon="person-outline" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="words" error={error?.message} />
                  )}
                />
                <View style={styles.inputSeparator}>
                  <View style={styles.inputSepLine} />
                  <Ionicons name="mail-outline" size={12} color="#C5CDD8" style={{ marginHorizontal: 8 }} />
                  <View style={styles.inputSepLine} />
                </View>
                <Controller
                  control={control}
                  name="adminEmail"
                  rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' } }}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <FloatInput label="Work Email Address" icon="mail-outline" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="email-address" error={error?.message} />
                  )}
                />
                <View style={styles.inputSeparator}>
                  <View style={styles.inputSepLine} />
                  <Ionicons name="lock-closed-outline" size={12} color="#C5CDD8" style={{ marginHorizontal: 8 }} />
                  <View style={styles.inputSepLine} />
                </View>
                <Controller
                  control={control}
                  name="adminPassword"
                  rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <FloatInput label="Secure Password" icon="lock-closed-outline" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={error?.message} />
                  )}
                />
              </>
            )}
          </Animated.View>

          {/* CTA Button */}
          {step === 0 ? (
            <TouchableOpacity style={styles.loginBtn} onPress={handleNext} activeOpacity={0.85}>
              <LinearGradient colors={[C.accentBright, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtnGradient}>
                <View style={styles.loginBtnInner}>
                  <Text style={styles.loginBtnText}>Continue</Text>
                  <View style={styles.loginBtnArrow}>
                    <Ionicons name="arrow-forward" size={16} color={C.accentBright} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[C.accentBright, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtnGradient}>
                {isSubmitting ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <View style={styles.loginBtnInner}>
                    <Text style={styles.loginBtnText}>Create Organization</Text>
                    <View style={styles.loginBtnArrow}>
                      <Ionicons name="checkmark" size={16} color={C.accentBright} />
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Back link on step 2 */}
          {step === 1 && (
            <TouchableOpacity onPress={() => { animateStep(); setStep(0); }} style={styles.backLinkRow} activeOpacity={0.7}>
              <Ionicons name="arrow-back-outline" size={13} color="#8A9BB5" />
              <Text style={styles.backLinkText}>Back to company details</Text>
            </TouchableOpacity>
          )}

          {/* Footer */}
          <View style={styles.footerRow}>
            <Ionicons name="information-circle-outline" size={13} color="#B0BAC8" />
            <Text style={styles.footerNote}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Sign in →</Text>
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

  // Header
  header: { paddingTop: 56, paddingHorizontal: 28, paddingBottom: 52, overflow: 'hidden' },
  orb1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(91,163,245,0.08)', top: -80, right: -60 },
  orb2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(29,184,160,0.07)', bottom: -20, left: -40 },
  orb3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', top: 40, right: 80 },
  gridLines: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },

  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  brandName: { fontSize: 17, fontWeight: '700', color: C.white, letterSpacing: 0.5, flex: 1 },

  heroText: { fontSize: 40, fontWeight: '800', color: C.white, letterSpacing: -1, lineHeight: 44, marginBottom: 6 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 },

  statRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  statDivider: { width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 12 },

  // Card
  cardOuter: { flex: 1, marginTop: -CARD_RADIUS },
  card: { flex: 1, backgroundColor: C.offWhite, borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS, paddingHorizontal: 24, paddingBottom: 24, overflow: 'hidden' },
  cardAccentBar: { height: 3, width: 56, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 24, opacity: 0.8 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  cardTitle: { fontSize: 26, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  cardSubtitle: { fontSize: 13, color: '#8A9BB5', marginTop: 4, lineHeight: 18 },
  cardAvatarRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(91,163,245,0.25)', padding: 2 },
  cardAvatar: { flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#EEF2F8', borderWidth: 1.5, borderColor: '#D8E0EC', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: C.accentBright, borderColor: C.accentBright },
  stepDotDone: { backgroundColor: C.teal, borderColor: C.teal },
  stepDotText: { fontSize: 11, fontWeight: '700', color: '#A0AEC0' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#EEF2F8', marginHorizontal: 6 },
  stepLineDone: { backgroundColor: C.teal },

  // API Error
  apiErrorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F0', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16, gap: 8, borderLeftWidth: 3, borderLeftColor: C.errorRed },
  apiErrorText: { fontSize: 13, color: C.errorRed, flex: 1 },

  // Inputs
  inputsCard: { backgroundColor: C.white, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16, shadowColor: C.navy, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#EEF2F8' },
  inputSeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  inputSepLine: { flex: 1, height: 1, backgroundColor: '#F0F3F8' },
  inputWrap: { marginVertical: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 0, borderRadius: 12, minHeight: 62, overflow: 'hidden' },
  inputBoxFocused: { backgroundColor: '#F8FBFF' },
  inputIconStrip: { width: 44, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F9FD', borderRightWidth: 1, borderRightColor: '#EEF2F8', marginRight: 12 },
  inputIconStripActive: { backgroundColor: '#EEF6FF', borderRightColor: 'rgba(91,163,245,0.25)' },
  inputInner: { flex: 1, paddingTop: 18, paddingRight: 4 },
  floatLabel: { position: 'absolute', left: 0 },
  inputText: { fontSize: 15, color: C.navy, paddingVertical: 2, fontWeight: '500' },
  eyeBtn: { padding: 12, alignSelf: 'stretch', justifyContent: 'center' },
  checkBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginLeft: 2 },
  errorText: { fontSize: 12, color: C.errorRed },

  // Button
  loginBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGradient: { paddingVertical: 16, paddingHorizontal: 24 },
  loginBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: C.white, letterSpacing: 0.4 },
  loginBtnArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },

  // Footer
  backLinkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12, marginBottom: 4 },
  backLinkText: { fontSize: 13, color: '#8A9BB5' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 20 },
  footerNote: { fontSize: 12, color: '#A0AEC0' },
  registerLink: { fontSize: 13, fontWeight: '700', color: C.teal },
});