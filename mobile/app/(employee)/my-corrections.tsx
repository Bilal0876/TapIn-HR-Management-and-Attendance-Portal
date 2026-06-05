import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar, RefreshControl, TouchableOpacity, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { attendanceApi } from '@/features/attendance/api';
import { format, parseISO } from 'date-fns';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
  danger: '#FF6B6B',
  warning: '#F59E0B',
  green: '#10B981',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PENDING: { label: 'Pending', color: '#D97706', bg: '#FFF7ED', icon: 'time-outline' },
  APPROVED: { label: 'Approved', color: C.green, bg: '#ECFDF5', icon: 'checkmark-circle-outline' },
  REJECTED: { label: 'Rejected', color: C.danger, bg: '#FFF0F0', icon: 'close-circle-outline' },
};

export default function MyCorrectionsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await attendanceApi.getMyCorrections();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const renderItem = ({ item }: { item: any }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
    const date = item.attendanceRecord?.date
      ? format(parseISO(item.attendanceRecord.date), 'EEEE, MMM dd')
      : '—';

    const fmtTime = (t?: string) => t ? format(parseISO(t), 'hh:mm a') : '—';

    return (
      <View style={s.card}>
        {/* Header */}
        <View style={s.cardHeader}>
          <Text style={s.cardDate}>{date}</Text>
          <View style={[s.badge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Time comparison */}
        <View style={s.timeGrid}>
          <View style={s.timeCol}>
            <Text style={s.timeHead}>Original</Text>
            <Text style={s.timeVal}>{fmtTime(item.originalCheckin)}</Text>
            <Text style={[s.timeVal, { opacity: 0.6 }]}>{fmtTime(item.originalCheckout)}</Text>
          </View>
          <View style={s.timeArrow}>
            <Ionicons name="arrow-forward" size={18} color="#E2E8F0" />
          </View>
          <View style={s.timeCol}>
            <Text style={s.timeHead}>Requested</Text>
            <Text style={[s.timeVal, { color: C.accent }]}>{fmtTime(item.requestedCheckin)}</Text>
            <Text style={[s.timeVal, { color: C.accent, opacity: 0.6 }]}>{fmtTime(item.requestedCheckout)}</Text>
          </View>
        </View>

        {/* Reason */}
        {item.reason ? (
          <View style={s.reasonRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={13} color={C.subtle} />
            <Text style={s.reasonText} numberOfLines={2}>{item.reason}</Text>
          </View>
        ) : null}

        {/* Review note if rejected */}
        {item.status === 'REJECTED' && item.reviewNote ? (
          <View style={[s.reviewNote, { borderLeftColor: C.danger }]}>
            <Text style={[s.reviewNoteText, { color: C.danger }]}>"{item.reviewNote}"</Text>
          </View>
        ) : null}

        {item.status === 'APPROVED' && item.reviewNote ? (
          <View style={[s.reviewNote, { borderLeftColor: C.green }]}>
            <Text style={[s.reviewNoteText, { color: C.green }]}>"{item.reviewNote}"</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <Text style={s.headerTitle}>My Requests</Text>
        <Text style={s.headerSub}>Track your correction submissions</Text>
      </View>

      {/* CTA to submit new correction via History */}
      <TouchableOpacity style={s.ctaBanner} onPress={() => router.push('/(employee)/history')} activeOpacity={0.8}>
        <View style={s.ctaLeft}>
          <Ionicons name="create-outline" size={20} color={C.accent} />
          <Text style={s.ctaText}>Need to correct attendance?</Text>
        </View>
        <Text style={s.ctaLink}>Go to History →</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="receipt-outline" size={64} color="#E2E8F0" />
              <Text style={s.emptyTitle}>No requests yet</Text>
              <Text style={s.emptySub}>Tap a record in History to submit a correction</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: C.subtle, marginTop: 4, fontWeight: '500' },
  ctaBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(91,163,245,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(91,163,245,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaText: { fontSize: 13, fontWeight: '600', color: C.navy },
  ctaLink: { fontSize: 13, fontWeight: '700', color: C.accent },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardDate: { fontSize: 15, fontWeight: '700', color: C.navy },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  timeGrid: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  timeCol: { flex: 1 },
  timeArrow: { paddingHorizontal: 8 },
  timeHead: { fontSize: 10, fontWeight: '700', color: C.subtle, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
  timeVal: { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 2 },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  reasonText: { fontSize: 13, color: C.subtle, flex: 1, lineHeight: 18 },
  reviewNote: { marginTop: 10, paddingLeft: 10, borderLeftWidth: 3 },
  reviewNoteText: { fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#CBD5E1', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#CBD5E1', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
