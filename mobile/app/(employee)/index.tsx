import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckInButton } from '@/features/attendance/components/CheckInButton';
import { BreakButton } from '@/features/attendance/components/BreakButton';
import { attendanceApi } from '@/features/attendance/api';
import { useAuthStore } from '@/features/auth/store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  bg: '#F8FAFC',
  white: '#FFFFFF',
};

import { useTodayAttendance } from '@/features/attendance/hooks';
import { format, parseISO, addMinutes } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EmployeeHome() {
  const { employee } = useAuthStore();
  const { data: record, isLoading, refetch } = useTodayAttendance();

  if (isLoading) {
    return (
      <SafeAreaView style={s.root}>
        <View style={{ padding: 24 }}>
          <Skeleton width={180} height={32} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 32 }} />
          
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Skeleton width={180} height={180} borderRadius={90} />
          </View>

          <Skeleton width="100%" height={80} borderRadius={24} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={120} borderRadius={24} />
        </View>
      </SafeAreaView>
    );
  }

  const activeBreak = record?.breakSessions?.find((b: any) => !b.endTime);
  const previouslyConsumedSeconds = (record?.breakSessions || [])
    .filter((b: any) => b.endTime)
    .reduce((sum: number, b: any) => {
      const diff = Math.floor((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 1000);
      return sum + Math.max(0, diff);
    }, 0);

  // Dynamic Shift Info
  const expectedCheckinStr = record?.config?.expectedCheckin || '09:00';
  const workMinutes = record?.config?.expectedWorkMinutes || 480;

  // Convert expected checkin to 12h
  const [h, m] = expectedCheckinStr.split(':').map(Number);
  const checkin12h = format(new Date().setHours(h, m, 0, 0), 'hh:mm a');

  // Calculate approximate checkout time
  const shiftStart = new Date();
  shiftStart.setHours(h, m, 0, 0);
  const shiftEnd = addMinutes(shiftStart, workMinutes + 60); // Assuming 1 hour break
  const checkoutTimeStr = format(shiftEnd, 'hh:mm a');

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hello, {employee?.name?.split(' ')[0]}</Text>
            <Text style={s.subtitle}>Shift: {checkin12h} — {checkoutTimeStr}</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color={C.navy} />
            <View style={s.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* ── Dashboard Stats ── */}
        <View style={s.dashboard}>
          <View style={s.centerCard}>
            <CheckInButton
              status={record?.status || 'IDLE'}
              checkinTime={record?.checkinTime ? format(parseISO(record.checkinTime), 'hh:mm a') : null}
              checkoutTime={record?.checkoutTime ? format(parseISO(record.checkoutTime), 'hh:mm a') : null}
              workingHours={record?.dailySummary?.totalWorkMinutes ?
                `${Math.floor(record.dailySummary.totalWorkMinutes / 60)}h ${record.dailySummary.totalWorkMinutes % 60}m`
                : null
              }
              onRefresh={refetch}
            />
          </View>

          {record?.status === 'PENDING' && (
            <View style={s.breakWrapper}>
              <View style={s.dividerRow}>
                <View style={s.hr} />
                <Text style={s.dividerText}>PAUSE & RECHARGE</Text>
                <View style={s.hr} />
              </View>
              <BreakButton
                activeBreak={activeBreak}
                attendanceStatus={record.status}
                previouslyConsumedSeconds={previouslyConsumedSeconds}
                onRefresh={refetch}
              />
            </View>
          )}

          {/* Tips Section */}
          <View style={s.tipCard}>
            <LinearGradient
              colors={['#EEF2FF', '#E0E7FF']}
              style={s.tipGradient}
            >
              <Ionicons name="bulb" size={24} color="#4F46E5" />
              <View style={s.tipInfo}>
                <Text style={s.tipTitle}>Shift Reminder</Text>
                <Text style={s.tipText}>
                  Your estimated shift end is {checkoutTimeStr}. Don't forget to check-out to log your hours accurately.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24
  },
  greeting: { fontSize: 24, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    borderWidth: 1.5,
    borderColor: C.white
  },
  dashboard: { paddingHorizontal: 20 },
  centerCard: { alignItems: 'center', marginBottom: 32 },
  breakWrapper: { alignItems: 'center', marginBottom: 32 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, width: '100%' },
  hr: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 1 },
  tipCard: { marginTop: 20, borderRadius: 24, overflow: 'hidden' },
  tipGradient: { flexDirection: 'row', padding: 20, gap: 16, alignItems: 'flex-start' },
  tipInfo: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: '#312E81', marginBottom: 4 },
  tipText: { fontSize: 13, color: '#4338CA', lineHeight: 18, opacity: 0.8 }
});
