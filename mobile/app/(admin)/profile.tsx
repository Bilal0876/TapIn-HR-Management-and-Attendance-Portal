import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store';
import { secureStorage } from '@/lib/secureStorage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  danger: '#FF6B6B',
  bg: '#F8FAFC',
};

function SettingRow({ icon, label, color = C.navy, onPress }: any) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress}>
      <View style={[s.rowIcon, { backgroundColor: `${color}10` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.subtle} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

export default function AdminProfileScreen() {
  const { employee, clearAuth } = useAuthStore();

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
                  colors={['#818CF8', '#4F46E5']}
                  style={s.avatarGradient}
                >
                  <Text style={s.avatarText}>A</Text>
                </LinearGradient>
                <View style={s.adminBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={C.white} />
                </View>
              </View>
              
              <Text style={s.name}>{employee?.name || 'Administrator'}</Text>
              <View style={s.badge}>
                <Text style={s.badgeText}>SYSTEM SUPER ADMIN</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Content ── */}
        <View style={s.content}>
          
          <View style={s.section}>
            <Text style={s.sectionTitle}>System Management</Text>
            <View style={s.card}>
              <SettingRow icon="settings-outline" label="Global Settings" color={C.accent} />
              <View style={s.divider} />
              <SettingRow icon="notifications-outline" label="Alert Configurations" color={C.teal} />
              <View style={s.divider} />
              <SettingRow icon="people-outline" label="Role Permissions" color="#7C5CBF" />
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Support & Sync</Text>
            <View style={s.card}>
              <SettingRow icon="cloud-download-outline" label="External Export" color="#F59E0B" />
              <View style={s.divider} />
              <SettingRow icon="help-circle-outline" label="Admin Support" color="#10B981" />
            </View>
          </View>

          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
             <LinearGradient
               colors={['#FFF1F1', '#FFF1F1']}
               style={s.logoutGradient}
             >
               <Ionicons name="log-out-outline" size={20} color={C.danger} />
               <Text style={s.logoutText}>Log Out from Admin Console</Text>
             </LinearGradient>
          </TouchableOpacity>
          
          <Text style={s.version}>AttendX Admin v1.0.0 • Secure Session</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { 
    paddingBottom: 40,
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
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: C.teal,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: C.navy
  },
  name: { fontSize: 24, fontWeight: '800', color: C.white, marginBottom: 8 },
  badge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800', color: C.white, letterSpacing: 1 },
  
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 12, paddingLeft: 4 },
  card: { backgroundColor: C.white, borderRadius: 24, padding: 16, shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4 },
  
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  rowLabel: { fontSize: 15, color: C.navy, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F8FAFC' },
  
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
