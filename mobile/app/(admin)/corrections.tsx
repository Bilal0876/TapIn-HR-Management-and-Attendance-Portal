import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { correctionApi } from '@/features/corrections/api';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
  danger: '#FF6B6B',
};

export default function AdminCorrectionsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await correctionApi.getPending();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    Alert.alert(
      `${status === 'APPROVED' ? 'Approve' : 'Reject'} Request?`,
      'Do you want to confirm this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              await correctionApi.review(id, { status });
              loadData();
            } catch (e) {
              alert('Review failed');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.userInfo}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{item.employee.name[0]}</Text>
          </View>
          <View>
            <Text style={s.userName}>{item.employee.name}</Text>
            <Text style={s.userDept}>{item.employee.profile?.department || 'Member'}</Text>
          </View>
        </View>
        <Text style={s.dateText}>{format(parseISO(item.attendanceRecord.date), 'MMM dd')}</Text>
      </View>

      <View style={s.compareRow}>
        <View style={s.compareBox}>
          <Text style={s.compareLabel}>ORIGINAL</Text>
          <Text style={s.compareValue}>{format(parseISO(item.originalCheckin), 'HH:mm')}</Text>
          <Text style={s.compareValue}>
            {item.originalCheckout ? format(parseISO(item.originalCheckout), 'HH:mm') : '--:--'}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#E2E8F0" />
        <View style={s.compareBox}>
          <Text style={[s.compareLabel, { color: C.accent }]}>REQUESTED</Text>
          <Text style={s.compareValue}>{item.requestedCheckin ? format(parseISO(item.requestedCheckin), 'HH:mm') : 'NC'}</Text>
          <Text style={s.compareValue}>{item.requestedCheckout ? format(parseISO(item.requestedCheckout), 'HH:mm') : 'NC'}</Text>
        </View>
      </View>

      <View style={s.reasonBox}>
        <Text style={s.reasonLabel}>REASON</Text>
        <Text style={s.reasonText}>{item.reason}</Text>
      </View>

      <View style={s.actions}>
        <TouchableOpacity 
          style={[s.actionBtn, s.rejectBtn]} 
          onPress={() => handleReview(item.id, 'REJECTED')}
        >
          <Ionicons name="close" size={20} color={C.danger} />
          <Text style={s.rejectText}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[s.actionBtn, s.approveBtn]} 
          onPress={() => handleReview(item.id, 'APPROVED')}
        >
          <Ionicons name="checkmark" size={20} color={C.white} />
          <Text style={s.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <Text style={s.headerTitle}>Approvals</Text>
        <Text style={s.headerSub}>{requests.length} pending correction requests</Text>
      </View>

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={C.accent} />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="happy-outline" size={60} color="#E2E8F0" />
              <Text style={s.emptyText}>All caught up!</Text>
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
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.navy },
  headerSub: { fontSize: 14, color: C.subtle, marginTop: 4, fontWeight: '500' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: C.white, borderRadius: 24, padding: 20, marginBottom: 20, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  userInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: C.accent },
  userName: { fontSize: 16, fontWeight: '700', color: C.navy },
  userDept: { fontSize: 12, color: C.subtle, fontWeight: '500' },
  dateText: { fontSize: 13, fontWeight: '600', color: C.subtle, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 20 },
  compareBox: { alignItems: 'center' },
  compareLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginBottom: 6, letterSpacing: 0.5 },
  compareValue: { fontSize: 16, fontWeight: '800', color: C.navy },
  reasonBox: { marginBottom: 24 },
  reasonLabel: { fontSize: 10, fontWeight: '700', color: C.subtle, marginBottom: 6, letterSpacing: 0.5 },
  reasonText: { fontSize: 14, color: '#475569', lineHeight: 20, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, gap: 8 },
  rejectBtn: { backgroundColor: '#FFF1F1', borderWidth: 1, borderColor: '#FFE4E4' },
  rejectText: { color: C.danger, fontWeight: '700' },
  approveBtn: { backgroundColor: C.accent },
  approveText: { color: C.white, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: '#CBD5E1' }
});
