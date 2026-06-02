import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store';
import { secureStorage } from '@/lib/secureStorage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePersonalStats } from '@/features/attendance/hooks';

const { width: SCREEN_W } = Dimensions.get('window');

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  danger: '#FF6B6B',
  bg: '#F8FAFC',
};

function ProfileRow({ icon, label, value, color = C.navy }: any) {
  return (
    <View style={s.row}>
      <View style={[s.rowIcon, { backgroundColor: `${color}10` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={s.rowInfo}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { employee, clearAuth } = useAuthStore();
  const { data: stats, isLoading } = usePersonalStats();

  const handleLogout = async () => {
    await secureStorage.removeTokens();
    clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* ── Header ── */}
        <LinearGradient
          colors={[C.navy, '#1E293B']}
          style={s.header}
        >
          <SafeAreaView>
            <View style={s.headerContent}>
              <View style={s.avatarContainer}>
                <LinearGradient
                  colors={[C.accent, C.teal]}
                  style={s.avatarGradient}
                >
                  <Text style={s.avatarText}>
                    {employee?.name ? employee.name[0].toUpperCase() : 'U'}
                  </Text>
                </LinearGradient>
                <TouchableOpacity style={s.editBadge} onPress={() => Alert.alert('Coming Soon', 'Profile picture editing will be available in a future update.')}>
                  <Ionicons name="camera" size={14} color={C.white} />
                </TouchableOpacity>
              </View>
              
              <Text style={s.name}>{employee?.name}</Text>
              <Text style={s.role}>{employee?.role} • {employee?.department || 'Operations'}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Content ── */}
        <View style={s.content}>
          
          {/* Stats Card */}
          <View style={s.statsWrapper}>
             <View style={s.statBox}>
                <Text style={s.statVal}>{isLoading ? '...' : `${stats?.onTimeRate}%`}</Text>
                <Text style={s.statLbl}>On-Time</Text>
             </View>
             <View style={s.statDivider} />
             <View style={s.statBox}>
                <Text style={s.statVal}>{isLoading ? '...' : stats?.leavesTaken}</Text>
                <Text style={s.statLbl}>Leaves</Text>
             </View>
             <View style={s.statDivider} />
             <View style={s.statBox}>
                <Text style={s.statVal}>{isLoading ? '...' : `${stats?.avgWorkHours}h`}</Text>
                <Text style={s.statLbl}>Avg Work</Text>
             </View>
          </View>

          {/* Details Section */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Account Details</Text>
            <View style={s.card}>
              <ProfileRow icon="mail-outline" label="Official Email" value={employee?.email} color={C.accent} />
              <View style={s.divider} />
              <ProfileRow icon="finger-print-outline" label="Employee ID" value={employee?.employeeCode || 'EMP-001'} color={C.teal} />
              <View style={s.divider} />
              <ProfileRow icon="briefcase-outline" label="Designation" value={employee?.designation || 'Software Engineer'} color="#7C5CBF" />
            </View>
          </View>

          {/* Actions Section */}
          <View style={s.section}>
             <Text style={s.sectionTitle}>Preferences</Text>
             <View style={s.card}>
                <TouchableOpacity style={s.actionRow} onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon.')}>
                   <Ionicons name="notifications-outline" size={20} color={C.navy} />
                   <Text style={s.actionText}>Notifications</Text>
                   <Ionicons name="chevron-forward" size={18} color={C.subtle} style={{marginLeft: 'auto'}} />
                </TouchableOpacity>
                <View style={s.divider} />
                <TouchableOpacity style={s.actionRow} onPress={() => Alert.alert('Coming Soon', 'Privacy controls will be available in the next version.')}>
                   <Ionicons name="shield-checkmark-outline" size={20} color={C.navy} />
                   <Text style={s.actionText}>Privacy & Security</Text>
                   <Ionicons name="chevron-forward" size={18} color={C.subtle} style={{marginLeft: 'auto'}} />
                </TouchableOpacity>
             </View>
          </View>

          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
             <LinearGradient
               colors={['#FFF1F1', '#FFF1F1']}
               style={s.logoutGradient}
             >
               <Ionicons name="log-out-outline" size={20} color={C.danger} />
               <Text style={s.logoutText}>Sign Out from AttendX</Text>
             </LinearGradient>
          </TouchableOpacity>
          
          <Text style={s.version}>AttendX v1.0.0 • Build 2026.05</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { 
    paddingBottom: 120,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: { alignItems: 'center', paddingTop: 20 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarGradient: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  avatarText: { fontSize: 40, fontWeight: '800', color: C.white },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: C.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: C.navy
  },
  name: { fontSize: 24, fontWeight: '800', color: C.white, marginBottom: 4 },
  role: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  statsWrapper: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    marginTop: -30,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center'
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: C.navy },
  statLbl: { fontSize: 11, color: C.subtle, marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: '#F1F5F9' },
  
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 12, paddingLeft: 4 },
  card: { backgroundColor: C.white, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 11, color: C.subtle, fontWeight: '600', marginBottom: 2 },
  rowValue: { fontSize: 15, color: C.navy, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginVertical: 4 },
  
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  actionText: { fontSize: 15, fontWeight: '600', color: C.navy },
  
  logoutBtn: { marginTop: 40 },
  logoutGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
    borderRadius: 18, 
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFE4E4'
  },
  logoutText: { color: C.danger, fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', marginTop: 24, color: '#CBD5E1', fontSize: 11, fontWeight: '500' }
});
