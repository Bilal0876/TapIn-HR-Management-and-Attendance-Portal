import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { employeeApi } from '@/features/employees/api';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
  label: '#64748B',
};

function StyledInput({ label, icon, value, onChangeText, placeholder, error, ...props }: any) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label}</Text>
      <View style={[
        s.inputBox, 
        focused && s.inputBoxFocused,
        error && s.inputBoxError
      ]}>
        <Ionicons name={icon} size={18} color={focused ? C.accent : C.label} style={s.inputIcon} />
        <TextInput 
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#CBD5E1"
          {...props}
        />
      </View>
      {error && <Text style={s.errorText}>{error}</Text>}
    </View>
  );
}

export default function CreateEmployeeScreen() {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      employeeCode: '',
      designation: '',
      department: '',
      role: 'EMPLOYEE'
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setApiError(null);
    try {
      await employeeApi.create(data);
      router.back();
    } catch (e: any) {
      setApiError(e.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.navy} />
          </TouchableOpacity>
          <View>
            <Text style={s.title}>Add New Member</Text>
            <Text style={s.headerSubtext}>Onboard a new teammate</Text>
          </View>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {apiError && (
            <View style={s.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={s.errorBannerText}>{apiError}</Text>
            </View>
          )}

          <View style={s.card}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Full name is required' }}
              render={({ field: { onChange, value } }) => (
                <StyledInput label="Full Name" icon="person-outline" value={value} onChangeText={onChange} placeholder="e.g. John Doe" error={errors.name?.message} />
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } }}
              render={({ field: { onChange, value } }) => (
                <StyledInput label="Email Address" icon="mail-outline" value={value} onChangeText={onChange} placeholder="e.g. john@company.com" error={errors.email?.message} keyboardType="email-address" />
              )}
            />

            <Controller
              control={control}
              name="employeeCode"
              rules={{ required: 'Employee code is required' }}
              render={({ field: { onChange, value } }) => (
                <StyledInput label="Employee ID" icon="finger-print-outline" value={value} onChangeText={onChange} placeholder="e.g. EMP-123" error={errors.employeeCode?.message} />
              )}
            />

            <Controller
              control={control}
              name="designation"
              render={({ field: { onChange, value } }) => (
                <StyledInput label="Designation" icon="briefcase-outline" value={value} onChangeText={onChange} placeholder="e.g. Software Engineer" />
              )}
            />

            <Controller
              control={control}
              name="department"
              render={({ field: { onChange, value } }) => (
                <StyledInput label="Department" icon="business-outline" value={value} onChangeText={onChange} placeholder="e.g. Engineering" />
              )}
            />
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit(onSubmit)} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={[C.accent, '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.gradientBtn}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <>
                  <Text style={s.submitText}>Complete Onboarding</Text>
                  <Ionicons name="chevron-forward" size={18} color={C.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 10 },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: C.white, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  title: { fontSize: 24, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  headerSubtext: { fontSize: 13, color: C.subtle, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24 },
  card: { backgroundColor: C.white, borderRadius: 24, padding: 20, shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 8, marginLeft: 4 },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    minHeight: 56 
  },
  inputBoxFocused: { borderColor: C.accent, backgroundColor: C.white },
  inputBoxError: { borderColor: '#FECACA' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: C.navy, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 6, marginLeft: 4, fontWeight: '600' },
  submitBtn: { marginTop: 12, borderRadius: 18, overflow: 'hidden', shadowColor: C.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  submitText: { color: C.white, fontSize: 16, fontWeight: '800' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 14, borderRadius: 16, marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#FEE2E2' },
  errorBannerText: { color: '#EF4444', fontSize: 13, fontWeight: '600', flex: 1 }
});
