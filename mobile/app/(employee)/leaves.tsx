import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMyLeaves } from '@/features/leaves/hooks';
import { format } from 'date-fns';
import { LeaveRequest } from '@/features/leaves/api';

const C = {
  bg: '#F8FAFC',
  white: '#FFFFFF',
  navy: '#1E293B',
  gray: '#64748B',
  accent: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#E2E8F0',
};

export default function LeavesScreen() {
  const router = useRouter();
  const { data: leaves, isLoading, refetch } = useMyLeaves();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return C.success;
      case 'REJECTED': return C.danger;
      default: return C.warning;
    }
  };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: 'My Leaves', headerShown: true }} />
      
      <ScrollView 
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View style={s.header}>
          <Text style={s.title}>Leave History</Text>
          <TouchableOpacity 
            style={s.reqBtn} 
            onPress={() => router.push('/(employee)/request-leave')}
          >
            <Ionicons name="add" size={20} color={C.white} />
            <Text style={s.reqBtnText}>New Request</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />
        ) : leaves?.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="airplane-outline" size={64} color={C.border} />
            <Text style={s.emptyText}>No leave requests yet</Text>
          </View>
        ) : (
          leaves?.map((leave: LeaveRequest) => (
            <View key={leave.id} style={s.card}>
              <View style={s.cardHeader}>
                <View>
                  <Text style={s.leaveType}>{leave.type}</Text>
                  <Text style={s.leaveDates}>
                    {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: getStatusColor(leave.status) + '20' }]}>
                  <Text style={[s.statusText, { color: getStatusColor(leave.status) }]}>{leave.status}</Text>
                </View>
              </View>
              
              <Text style={s.reason} numberOfLines={2}>{leave.reason}</Text>
              
              {leave.reviewNote && (
                <View style={s.noteBox}>
                  <Text style={s.noteTitle}>Admin Note:</Text>
                  <Text style={s.noteText}>{leave.reviewNote}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: C.navy },
  reqBtn: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  reqBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  leaveType: { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 2 },
  leaveDates: { fontSize: 13, color: C.gray },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800' },
  reason: { fontSize: 14, color: C.navy, lineHeight: 20 },
  noteBox: { marginTop: 12, padding: 12, backgroundColor: C.bg, borderRadius: 8 },
  noteTitle: { fontSize: 11, fontWeight: '800', color: C.gray, marginBottom: 2, textTransform: 'uppercase' },
  noteText: { fontSize: 13, color: C.navy, fontStyle: 'italic' },
  empty: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { marginTop: 12, fontSize: 16, color: C.gray, fontWeight: '600' }
});
