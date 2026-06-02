import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { attendanceApi } from '@/features/attendance/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
};

export default function ShiftSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [breakMinutesAllocated, setBreakMinutesAllocated] = useState('60');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState('10');

  useEffect(() => {
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
      Alert.alert('Saved', 'Company shift settings updated.');
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
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.navy} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Shift Settings</Text>
          <Text style={s.sub}>Configure company-wide shift schedule</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.label}>Shift Start (HH:mm)</Text>
        <TextInput style={s.input} value={shiftStart} onChangeText={setShiftStart} placeholder="09:00" />

        <Text style={s.label}>Shift End (HH:mm)</Text>
        <TextInput style={s.input} value={shiftEnd} onChangeText={setShiftEnd} placeholder="18:00" />

        <Text style={s.label}>Break Minutes</Text>
        <TextInput
          style={s.input}
          value={breakMinutesAllocated}
          onChangeText={setBreakMinutesAllocated}
          placeholder="60"
          keyboardType="number-pad"
        />

        <Text style={s.label}>Grace Minutes</Text>
        <TextInput
          style={s.input}
          value={gracePeriodMinutes}
          onChangeText={setGracePeriodMinutes}
          placeholder="10"
          keyboardType="number-pad"
        />
      </View>

      <TouchableOpacity style={s.saveBtn} onPress={onSave} disabled={saving}>
        {saving ? <ActivityIndicator color={C.white} /> : <Text style={s.saveText}>Save Shift Settings</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: C.navy },
  sub: { color: C.subtle, marginTop: 2 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16 },
  label: { fontSize: 12, color: C.subtle, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.navy,
    backgroundColor: '#F8FAFC',
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: C.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveText: { color: C.white, fontWeight: '800', fontSize: 15 },
});
