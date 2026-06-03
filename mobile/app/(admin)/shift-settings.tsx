import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { attendanceApi } from '@/features/attendance/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/features/auth/store';

const { width: SCREEN_W } = Dimensions.get('window');

const C = {
  navy: '#0F1D3A',
  navyMid: '#162447',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
};

function SettingInput({ label, value, onChange, placeholder, icon, keyboard = 'default' }: any) {
  return (
    <View style={s.inputWrapper}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputContainer}>
        <View style={s.inputIcon}>
          <Ionicons name={icon} size={18} color={C.accent} />
        </View>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#CBD5E1"
          keyboardType={keyboard}
        />
      </View>
    </View>
  );
}

export default function ShiftSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [breakMinutesAllocated, setBreakMinutesAllocated] = useState('60');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState('10');

  const { employee } = useAuthStore();

  useEffect(() => {
    if (employee?.role !== 'SUPER_ADMIN') {
      Alert.alert('Access Denied', 'Only Super Admins can modify company shift settings.');
      router.back();
      return;
    }

    attendanceApi
      .getCompanyShiftSettings()
      .then((data) => {
        setShiftStart(data.shiftStart);
        setShiftEnd(data.shiftEnd);
        setBreakMinutesAllocated(String(data.breakMinutesAllocated));
        setGracePeriodMinutes(String(data.gracePeriodMinutes));
      })
      .catch(() => Alert.alert('Error', 'Could not load shift settings.'))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async () => {
    const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(shiftStart) || !timeRegex.test(shiftEnd)) {
      return Alert.alert('Invalid time', 'Use HH:mm format, e.g. 09:00 or 18:00.');
    }

    const breakMins = Number(breakMinutesAllocated);
    const graceMins = Number(gracePeriodMinutes);
    if (Number.isNaN(breakMins) || breakMins < 0) {
      return Alert.alert('Invalid break', 'Break minutes must be 0 or more.');
    }
    if (Number.isNaN(graceMins) || graceMins < 0) {
      return Alert.alert('Invalid grace', 'Grace minutes must be 0 or more.');
    }

    setSaving(true);
    try {
      await attendanceApi.updateCompanyShiftSettings({
        shiftStart,
        shiftEnd,
        breakMinutesAllocated: breakMins,
        gracePeriodMinutes: graceMins,
      });
      Alert.alert('Success', 'Organization settings updated successfully.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not update shift settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.accent} size="large" />
        <Text style={s.loadingText}>Fetching rules...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.root}
    >
      <StatusBar barStyle="light-content" />

      {/* ── Premium Header ── */}
      <LinearGradient colors={[C.navy, C.navyMid]} style={s.premiumHeader}>
        <SafeAreaView>
          <View style={s.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={24} color={C.white} />
            </TouchableOpacity>
            <View>
              <Text style={s.title}>Workplace Rules</Text>
              <Text style={s.sub}>Configure organization shift behavior</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.sectionHeader}>
          <Ionicons name="time" size={20} color={C.navy} />
          <Text style={s.sectionTitle}>Shift Timing</Text>
        </View>

        <View style={s.card}>
          <SettingInput
            label="Shift Start"
            value={shiftStart}
            onChange={setShiftStart}
            placeholder="09:00"
            icon="log-in-outline"
          />
          <View style={s.divider} />
          <SettingInput
            label="Shift End"
            value={shiftEnd}
            onChange={setShiftEnd}
            placeholder="18:00"
            icon="log-out-outline"
          />
        </View>

        <View style={[s.sectionHeader, { marginTop: 32 }]}>
          <Ionicons name="cafe" size={20} color={C.navy} />
          <Text style={s.sectionTitle}>Policy & Grace Periods</Text>
        </View>

        <View style={s.card}>
          <SettingInput
            label="Daily Break Allowance"
            value={breakMinutesAllocated}
            onChange={setBreakMinutesAllocated}
            placeholder="60"
            icon="hourglass-outline"
            keyboard="number-pad"
          />
          <View style={s.divider} />
          <SettingInput
            label="Morning Grace Period"
            value={gracePeriodMinutes}
            onChange={setGracePeriodMinutes}
            placeholder="10"
            icon="shield-checkmark-outline"
            keyboard="number-pad"
          />
        </View>

        <Text style={s.infoText}>
          Changing these settings will apply to all employees immediately for the next tracking cycle.
        </Text>

        <TouchableOpacity style={s.saveBtn} onPress={onSave} disabled={saving}>
          <LinearGradient
            colors={[C.accent, '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.saveGradient}
          >
            {saving ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <>
                <Text style={s.saveText}>Update Workplace Rules</Text>
                <Ionicons name="checkmark-done" size={20} color={C.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  loadingText: { marginTop: 12, color: C.subtle, fontWeight: '600' },
  premiumHeader: {
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: C.white },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginTop: 2 },

  scroll: { padding: 24, paddingBottom: 60 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingLeft: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.navy },

  card: { backgroundColor: C.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  inputWrapper: { marginVertical: 8 },
  label: { fontSize: 11, fontWeight: '700', color: C.subtle, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: C.navy, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

  infoText: { textAlign: 'center', color: C.subtle, fontSize: 13, marginTop: 24, paddingHorizontal: 20, lineHeight: 20 },

  saveBtn: { marginTop: 32, shadowColor: C.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  saveGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20 },
  saveText: { color: C.white, fontWeight: '800', fontSize: 16 },
});
