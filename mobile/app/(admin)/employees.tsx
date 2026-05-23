import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { employeeApi } from '@/features/employees/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
};

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeApi.list();
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    // Subtle entry animation for list items
    const opacity = scrollY.interpolate({
      inputRange: [-1, 0, index * 100, (index + 2) * 100],
      outputRange: [1, 1, 1, 0],
    });

    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => {/* View Details */}}
        style={s.cardContainer}
      >
        <View style={s.card}>
          <LinearGradient
            colors={['#F1F5F9', '#FFFFFF']}
            style={s.avatarContainer}
          >
            <Text style={s.avatarText}>{item.name[0].toUpperCase()}</Text>
          </LinearGradient>

          <View style={s.info}>
            <Text style={s.name}>{item.name}</Text>
            <View style={s.tagRow}>
              <View style={[s.tag, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[s.tagText, { color: '#0369A1' }]}>
                  {item.profile?.designation || 'Member'}
                </Text>
              </View>
              <Text style={s.dot}>•</Text>
              <Text style={s.deptText}>{item.profile?.department || 'Support'}</Text>
            </View>
            <View style={s.emailRow}>
              <Ionicons name="mail-outline" size={12} color={C.subtle} />
              <Text style={s.email}>{item.email}</Text>
            </View>
          </View>

          <View style={s.chevronBox}>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Team Directory</Text>
          <Text style={s.headerSub}>{employees.length} Active Members</Text>
        </View>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/create-employee')}
        >
          <LinearGradient
            colors={[C.accent, '#3B82F6']}
            style={s.addBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="person-add" size={20} color={C.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Search Bar Placeholder ── */}
      <View style={s.searchBar}>
        <Ionicons name="search" size={20} color={C.subtle} />
        <Text style={s.searchText}>Search by name or department...</Text>
      </View>

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={s.loaderText}>Syncing Team...</Text>
        </View>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          onRefresh={loadData}
          refreshing={loading}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 12,
    paddingBottom: 20
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: C.subtle, marginTop: 2, fontWeight: '500' },
  addBtn: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  searchText: { color: '#94A3B8', fontSize: 14 },
  list: { paddingHorizontal: 24, paddingBottom: 120 },
  cardContainer: { marginBottom: 12 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: C.white, 
    padding: 16, 
    borderRadius: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  avatarContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: C.navy },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: C.navy, marginBottom: 4 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '700' },
  dot: { color: '#CBD5E1', fontSize: 10 },
  deptText: { fontSize: 12, color: C.subtle, fontWeight: '500' },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  email: { fontSize: 12, color: '#94A3B8' },
  chevronBox: { marginLeft: 8 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: C.subtle, fontSize: 14, fontWeight: '500' }
});
