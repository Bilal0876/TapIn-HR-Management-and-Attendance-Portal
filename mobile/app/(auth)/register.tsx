import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { secureStorage } from '@/lib/secureStorage';
import { router } from 'expo-router';

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
export default function RegisterScreen() {
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

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<any>({
    defaultValues: { companyName: '', timezone: 'UTC', adminName: '', adminEmail: '', adminPassword: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      setApiError(null);
      const res = await authApi.registerCompany(data);
      await secureStorage.setTokens(res.accessToken, res.refreshToken);
      setAuth(res.employee);
      // Directly boot the user into the admin dashboard!
      router.replace('/(admin)/');
    } catch (e: any) {
      setApiError(e.response?.data?.message || 'Failed to register. Please try again.');
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
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          <View style={styles.brandRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
               <Ionicons name="arrow-back" size={24} color={C.white} />
            </TouchableOpacity>
            <Text style={styles.brandName}>Onboarding</Text>
          </View>

          <Text style={styles.heroText}>Let's set up your{"\n"}organization.</Text>
          <Text style={styles.tagline}>Get started in less than 2 minutes.</Text>
        </Animated.View>
      </LinearGradient>

      {/* ── White card body ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.cardOuter}
      >
        <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {apiError && (
              <View style={styles.apiErrorBox}>
                <Ionicons name="warning-outline" size={14} color={C.errorRed} />
                <Text style={styles.apiErrorText}>{apiError}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Company Details</Text>
            
            <Controller
              control={control}
              name="companyName"
              rules={{ required: 'Company name is required' }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FloatInput
                  label="Company Name"
                  icon="business-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  error={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="timezone"
              rules={{ required: 'Timezone is required' }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FloatInput
                  label="Timezone (e.g., UTC, America/New_York)"
                  icon="globe-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Admin Account</Text>

            <Controller
              control={control}
              name="adminName"
              rules={{ required: 'Your name is required' }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FloatInput
                  label="Full Name"
                  icon="person-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  error={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="adminEmail"
              rules={{ 
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FloatInput
                  label="Work Email Address"
                  icon="mail-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  error={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="adminPassword"
              rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FloatInput
                  label="Secure Password"
                  icon="lock-closed-outline"
                  value={value}
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
                    <Text style={styles.loginBtnText}>Create Organization</Text>
                    <Ionicons name="checkmark-circle-outline" size={20} color={C.white} style={{ marginLeft: 6 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
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
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  brandName: { fontSize: 18, fontWeight: '700', color: C.white, letterSpacing: 0.5 },
  heroText: { fontSize: 32, fontWeight: '800', color: C.white, letterSpacing: -0.5, lineHeight: 38 },
  tagline: { fontSize: 15, color: '#8A9BB5', marginTop: 10, fontWeight: '500' },
  cardOuter: { flex: 1, marginTop: -CARD_RADIUS },
  card: { flex: 1, backgroundColor: C.offWhite, borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#8A9BB5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 2 },
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
  loginBtn: { marginTop: 12, borderRadius: 14, overflow: 'hidden' },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: C.white, letterSpacing: 0.3 },
});
