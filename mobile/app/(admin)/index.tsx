import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

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
          <TouchableOpacity style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color={C.navy} />
            <View style={s.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* ── Big Stats ── */}
        <View style={s.statRow}>
          <StatCard 
            title="Today's Attendance" 
            value="86%" 
            icon="people" 
            colors={[C.accent, '#3B82F6']} 
            subtitle="+4% from yesterday"
          />
          <StatCard 
            title="Late Arrivals" 
            value="3" 
            icon="time" 
            colors={['#FF6B6B', '#EE5253']} 
            subtitle="Needs attention"
          />
        </View>

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

            <TouchableOpacity style={s.actionItem}>
              <View style={[s.actionIcon, { backgroundColor: '#FDF2F9' }]}>
                <Ionicons name="settings-outline" size={24} color="#DB2777" />
              </View>
              <Text style={s.actionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Activity ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
             <Text style={s.sectionTitle}>Real-time Feed</Text>
             <TouchableOpacity><Text style={s.viewAll}>View All</Text></TouchableOpacity>
          </View>
          <View style={s.activityCard}>
             {[
               { name: 'John Doe', time: '09:02 AM', status: 'Checked In', color: C.teal },
               { name: 'Sarah Wilson', time: '08:55 AM', status: 'Checked In', color: C.teal },
               { name: 'Mike Ross', time: '08:45 AM', status: 'Late', color: '#FF6B6B' },
             ].map((item, i) => (
               <View key={i} style={[s.activityRow, i === 2 && { borderBottomWidth: 0 }]}>
                  <View style={[s.activityDot, { backgroundColor: item.color }]} />
                  <View style={s.activityInfo}>
                     <Text style={s.activityName}>{item.name}</Text>
                     <Text style={s.activitySub}>{item.status} today</Text>
                  </View>
                  <Text style={s.activityTime}>{item.time}</Text>
               </View>
             ))}
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
  
  activityCard: { backgroundColor: C.white, borderRadius: 24, padding: 8, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  activityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 15, fontWeight: '700', color: C.navy },
  activitySub: { fontSize: 12, color: C.subtle, marginTop: 2 },
  activityTime: { fontSize: 12, fontWeight: '600', color: C.navy }
});
