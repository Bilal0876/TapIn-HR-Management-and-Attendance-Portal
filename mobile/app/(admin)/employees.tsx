import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  Animated,
  TextInput,
  Alert
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
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeApi.list();
      setEmployees(data);
    } catch (e) {
      console.error(e);
      setError('Could not load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredEmployees = employees.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.profile?.department?.toLowerCase().includes(q) ||
      item.profile?.designation?.toLowerCase().includes(q) ||
      item.profile?.employeeCode?.toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    // Subtle entry animation for list items
    const opacity = scrollY.interpolate({
      inputRange: [-1, 0, index * 100, (index + 2) * 100],
      outputRange: [1, 1, 1, 0],
    });

    const handleDeactivate = () => {
      Alert.alert(
        'Remove Employee?',
        `This will deactivate ${item.name} and remove them from active lists.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await employeeApi.deactivate(item.id);
                await loadData();
              } catch (e: any) {
                Alert.alert('Error', e?.response?.data?.message || 'Failed to remove employee.');
              }
            },
          },
        ]
      );
    };

    return (
      <View style={s.cardContainer}>
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

          <TouchableOpacity style={s.removeBtn} onPress={handleDeactivate}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Team Directory</Text>
          <Text style={s.headerSub}>{filteredEmployees.length} Active Members</Text>
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

      {/* ── Search Bar ── */}
      <View style={s.searchBar}>
        <Ionicons name="search" size={20} color={C.subtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, email, department..."
          placeholderTextColor="#94A3B8"
          style={s.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={s.errorCard}>
          <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={loadData}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={s.loaderText}>Syncing Team...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
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
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="search-outline" size={52} color="#CBD5E1" />
              <Text style={s.emptyText}>
                {query.trim() ? 'No employees match your search.' : 'No active employees yet.'}
              </Text>
            </View>
          }
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
  errorCard: {
    marginHorizontal: 24,
    marginBottom: 12,
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
  searchInput: { flex: 1, color: C.navy, fontSize: 14, fontWeight: '500' },
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
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: C.subtle, fontSize: 14, fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 40, paddingHorizontal: 24 },
  emptyText: { marginTop: 12, color: C.subtle, fontSize: 13, fontWeight: '600', textAlign: 'center' }
});
