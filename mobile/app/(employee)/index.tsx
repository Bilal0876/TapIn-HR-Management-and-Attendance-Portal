import React, { useEffect, useRef } from 'react';
import {
  View, Text, ActivityIndicator, StatusBar,
  ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckInButton } from '@/features/attendance/components/CheckInButton';
import { BreakButton } from '@/features/attendance/components/BreakButton';
import { useAuthStore } from '@/features/auth/store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTodayAttendance } from '@/features/attendance/hooks';
import { format, parseISO, addMinutes } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';
import { ensurePermissions } from '@/lib/locationService';

// ── Animated wrapper that fades+scales when `status` changes
function AnimatedStatusView({ status, children }: { status: string; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const prevStatus = useRef(status);

  useEffect(() => {
    if (prevStatus.current === status) return;
    prevStatus.current = status;

    // Fade + shrink out, swap, fade + grow in
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.93, duration: 180, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
      ]),
    ]).start();
  }, [status]);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
}

export default function EmployeeHome() {
  const { employee } = useAuthStore();
  const { data: record, isLoading, refetch } = useTodayAttendance();

  // Request location permission once at startup (not on every tap)
  useEffect(() => { ensurePermissions(); }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="p-6">
          <Skeleton width={180} height={32} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 32 }} />
          <View className="items-center mb-10">
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
      const diff = Math.floor(
        (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 1000
      );
      return sum + Math.max(0, diff);
    }, 0);

  const expectedCheckinStr = record?.config?.expectedCheckin || '09:00';
  const workMinutes = record?.config?.expectedWorkMinutes || 480;
  const [h, m] = expectedCheckinStr.split(':').map(Number);
  const checkin12h = format(new Date().setHours(h, m, 0, 0), 'hh:mm a');
  const shiftStart = new Date();
  shiftStart.setHours(h, m, 0, 0);
  const shiftEnd = addMinutes(shiftStart, workMinutes + 60);
  const checkoutTimeStr = format(shiftEnd, 'hh:mm a');

  const workingHours = record?.dailySummary?.totalWorkMinutes
    ? `${Math.floor(record.dailySummary.totalWorkMinutes / 60)}h ${record.dailySummary.totalWorkMinutes % 60}m`
    : null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View className="flex-row justify-between items-center px-6 pt-3 pb-6">
          <View>
            <Text
              className="text-2xl font-extrabold text-[#0F1D3A]"
              style={{ letterSpacing: -0.5 }}
            >
              Hello, {employee?.name?.split(' ')[0]}
            </Text>
            <Text className="text-[13px] text-slate-500 mt-0.5 font-medium">
              Shift: {checkin12h} — {checkoutTimeStr}
            </Text>
          </View>

          <TouchableOpacity
            className="w-11 h-11 rounded-xl bg-white items-center justify-center"
            style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
          >
            <Ionicons name="notifications-outline" size={24} color="#0F1D3A" />
            <View
              className="absolute w-2 h-2 rounded-full bg-red-400"
              style={{
                top: 10, right: 10,
                borderWidth: 1.5, borderColor: '#FFFFFF',
              }}
            />
          </TouchableOpacity>
        </View>

        {/* ── Dashboard ── */}
        <View className="px-5">

          {/* CheckIn button — animated on status change, no horizontal padding so stats card spans full width */}
          <View style={{ marginBottom: 32 }}>
            <AnimatedStatusView status={record?.status || 'IDLE'}>
              <CheckInButton
                status={record?.status || 'IDLE'}
                checkinTime={record?.checkinTime ? format(parseISO(record.checkinTime), 'hh:mm a') : null}
                checkoutTime={record?.checkoutTime ? format(parseISO(record.checkoutTime), 'hh:mm a') : null}
                workingHours={workingHours}
                onRefresh={refetch}
              />
            </AnimatedStatusView>
          </View>

          {/* Break section */}
          {record?.status === 'PENDING' && (
            <View className="items-center mb-8">
              {/* Divider */}
              <View className="flex-row items-center gap-3 mb-5 w-full">
                <View className="flex-1 h-px bg-slate-200" />
                <Text className="text-[10px] font-bold text-slate-400 tracking-widest">
                  PAUSE &amp; RECHARGE
                </Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>

              <BreakButton
                activeBreak={activeBreak}
                attendanceStatus={record.status}
                previouslyConsumedSeconds={previouslyConsumedSeconds}
                onRefresh={refetch}
              />
            </View>
          )}

          {/* Tip card */}
          <View className="mt-5 rounded-3xl overflow-hidden">
            <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={{ flexDirection: 'row', padding: 20, gap: 16, alignItems: 'flex-start' }}>
              <Ionicons name="bulb" size={24} color="#4F46E5" />
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-indigo-900 mb-1">Shift Reminder</Text>
                <Text className="text-[13px] text-indigo-700 leading-[18px]" style={{ opacity: 0.8 }}>
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