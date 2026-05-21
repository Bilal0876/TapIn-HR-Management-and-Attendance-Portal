import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { attendanceApi } from '@/features/attendance/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
  danger: '#FF6B6B',
  warning: '#F59E0B'
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await attendanceApi.getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderItem = ({ item }: { item: any }) => {
    const hasIssue = !item.checkoutTime || item.dailySummary?.lateMinutes > 0;
    
    return (
      <TouchableOpacity 
        style={s.card} 
        activeOpacity={0.7}
        onPress={() => router.push({
          pathname: '/(employee)/request-correction',
          params: { recordId: item.id, date: item.date }
        })}
      >
        <View style={s.cardHeader}>
          <Text style={s.cardDate}>{format(parseISO(item.date), 'EEEE, MMM dd')}</Text>
          <View style={[s.statusBadge, { backgroundColor: item.status === 'COMPLETE' ? '#ECFDF5' : '#FFF7ED' }]}>
            <Text style={[s.statusText, { color: item.status === 'COMPLETE' ? '#059669' : '#D97706' }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={s.timeRow}>
          <View style={s.timeBox}>
            <Text style={s.timeLabel}>CHECK-IN</Text>
            <Text style={s.timeValue}>{format(parseISO(item.checkinTime), 'hh:mm a')}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#E2E8F0" />
          <View style={s.timeBox}>
            <Text style={s.timeLabel}>CHECK-OUT</Text>
            <Text style={s.timeValue}>
              {item.checkoutTime ? format(parseISO(item.checkoutTime), 'hh:mm a') : 'Missed'}
            </Text>
          </View>
        </View>

        {item.dailySummary && (
          <View style={s.footer}>
            <View style={s.footerItem}>
              <Ionicons name="time-outline" size={14} color={C.subtle} />
              <Text style={s.footerText}>{Math.floor(item.dailySummary.totalWorkMinutes / 60)}h {item.dailySummary.totalWorkMinutes % 60}m worked</Text>
            </View>
            {item.dailySummary.lateMinutes > 0 && (
              <View style={[s.footerItem, { marginLeft: 'auto' }]}>
                <Ionicons name="alert-circle" size={14} color={C.danger} />
                <Text style={[s.footerText, { color: C.danger }]}>{item.dailySummary.lateMinutes}m late</Text>
              </View>
            )}
          </View>
        )}

        {hasIssue && (
          <View style={s.correctionAction}>
            <Text style={s.correctionLabel}>Something wrong?</Text>
            <Text style={s.correctionBtn}>Request Correction</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <Text style={s.headerTitle}>Attendance History</Text>
        <Text style={s.headerSub}>Review and manage your logs</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="calendar-outline" size={60} color="#E2E8F0" />
              <Text style={s.emptyText}>No logs found yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: C.subtle, marginTop: 4, fontWeight: '500' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { 
    backgroundColor: C.white, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardDate: { fontSize: 16, fontWeight: '700', color: C.navy },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4 },
  timeBox: { alignItems: 'center' },
  timeLabel: { fontSize: 10, fontWeight: '700', color: C.subtle, marginBottom: 4, letterSpacing: 0.5 },
  timeValue: { fontSize: 17, fontWeight: '800', color: C.navy },
  footer: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  correctionAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  correctionLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  correctionBtn: { fontSize: 13, color: C.accent, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: '#CBD5E1' }
});
