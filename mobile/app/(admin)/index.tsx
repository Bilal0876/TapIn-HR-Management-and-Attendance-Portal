import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { attendanceApi } from '@/features/attendance/api';

const { width: SCREEN_W } = Dimensions.get('window');

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
};

function StatCard({ title, value, icon, colors, subtitle }: any) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.statCard}>
      <View style={s.statHeader}>
        <View style={s.statIconBox}>
          <Ionicons name={icon} size={20} color={C.white} />
        </View>
        <Text style={s.statValue}>{value}</Text>
      </View>
      <Text style={s.statTitle}>{title}</Text>
      <Text style={s.statSub}>{subtitle}</Text>
    </LinearGradient>
  );
}

export default function AdminHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getCompanyStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
      setError('Could not load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>System Overview</Text>
            <Text style={s.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
        </View>

        {/* ── Big Stats ── */}
        {error ? (
          <View style={s.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={loadDashboard}>
              <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <View style={s.statRow}>
          <StatCard 
            title="Today's Attendance" 
            value={loading ? '--' : `${Math.round(stats?.overallAttendance ?? 0)}%`}
            icon="people" 
            colors={[C.accent, '#3B82F6']} 
            subtitle={loading ? 'Syncing...' : `${stats?.present ?? 0} / ${stats?.total ?? 0} present`}
          />
          <StatCard 
            title="Avg. Work Hours" 
            value={loading ? '--' : `${stats?.avgWorkHours ?? 0}h`}
            icon="time" 
            colors={['#8B5CF6', '#7C3AED']} 
            subtitle="Team average (last 7 days)"
          />
        </View>
        )}

        {loading && (
          <View style={s.loadingRow}>
            <ActivityIndicator size="small" color={C.accent} />
            <Text style={s.loadingText}>Refreshing dashboard...</Text>
          </View>
        )}

        {/* ── Action Grid ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Command Center</Text>
          <View style={s.actionGrid}>
            <TouchableOpacity style={s.actionItem} onPress={() => router.push('/(admin)/create-employee')}>
              <View style={[s.actionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="person-add" size={24} color="#4F46E5" />
              </View>
              <Text style={s.actionLabel}>Add Staff</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={s.actionItem} onPress={() => router.push('/(admin)/leave-approvals')}>
              <View style={[s.actionIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="airplane" size={24} color="#059669" />
              </View>
              <Text style={s.actionLabel}>Leaves</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.actionItem} onPress={() => router.push('/(admin)/reports')}>
              <View style={[s.actionIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="document-text" size={24} color="#D97706" />
              </View>
              <Text style={s.actionLabel}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.actionItem} onPress={() => router.push('/(admin)/profile')}>
              <View style={[s.actionIcon, { backgroundColor: '#FDF2F9' }]}>
                <Ionicons name="settings-outline" size={24} color="#DB2777" />
              </View>
              <Text style={s.actionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 120 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24,
    paddingTop: 12
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  headerDate: { fontSize: 13, color: C.subtle, marginTop: 2, fontWeight: '500' },
  errorCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: { flex: 1, color: '#991B1B', fontSize: 12, fontWeight: '600' },
  retryBtn: { backgroundColor: C.white, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  retryText: { color: C.navy, fontSize: 12, fontWeight: '700' },
  statRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  statCard: { 
    flex: 1, 
    borderRadius: 24, 
    padding: 16,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: C.white },
  statTitle: { fontSize: 13, fontWeight: '700', color: C.white, marginBottom: 4 },
  statSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, marginTop: 12 },
  loadingText: { color: C.subtle, fontSize: 12, fontWeight: '600' },
  
  section: { marginTop: 32, paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.navy },
  viewAll: { fontSize: 13, fontWeight: '600', color: C.accent },
  
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionItem: { 
    width: (SCREEN_W - 48 - 12) / 2, 
    backgroundColor: C.white, 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  actionIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: C.navy },
});
