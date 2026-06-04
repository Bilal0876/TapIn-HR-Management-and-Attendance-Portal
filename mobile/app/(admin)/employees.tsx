import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useEmployees } from '@/hooks/useEmployees';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  muted: '#94A3B8',
  border: '#E8ECF4',
  bg: '#F2F4F8',
};

// Deterministic avatar color from name
const AVATAR_COLORS = ['#6366F1', '#0DBF97', '#F59E0B', '#F04E6A', '#8B5CF6', '#5BA3F5'];
function avatarColor(name: string) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

function EmployeeCard({ item, currentEmployee, onDeactivate }: any) {
  const color = avatarColor(item.name);
  const isAdmin = item.role !== 'EMPLOYEE';

  return (
    <View style={c.card}>
      {/* Avatar */}
      <View style={[c.avatar, { backgroundColor: `${color}18` }]}>
        <Text style={[c.avatarText, { color }]}>{item.name[0].toUpperCase()}</Text>
      </View>

      {/* Info */}
      <View style={c.info}>
        <View style={c.nameRow}>
          <Text style={c.name} numberOfLines={1}>{item.name}</Text>
          {isAdmin && (
            <View style={[c.rolePill, { backgroundColor: `${color}15` }]}>
              <Text style={[c.roleText, { color }]}>{item.role.replace('_', ' ')}</Text>
            </View>
          )}
        </View>
        <Text style={c.meta} numberOfLines={1}>
          {item.profile?.designation || 'Member'}
          {item.profile?.department ? `  ·  ${item.profile.department}` : ''}
        </Text>
        <Text style={c.email} numberOfLines={1}>{item.email}</Text>
      </View>

      {/* Delete */}
      {item.id !== currentEmployee?.id && (
        <TouchableOpacity style={c.deleteBtn} onPress={() => onDeactivate(item)}>
          <Ionicons name="trash-outline" size={15} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function EmployeesScreen() {
  const {
    filteredEmployees, loading, error,
    query, setQuery, loadData,
    handleDeactivate, currentEmployee,
  } = useEmployees();

  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom + 80 + 16;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Team Directory</Text>
          <Text style={s.sub}>{filteredEmployees.length} active members</Text>
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
            <Ionicons name="person-add" size={17} color={C.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={C.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, email, department…"
          placeholderTextColor={C.muted}
          style={s.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Error ── */}
      {error && (
        <View style={s.errorCard}>
          <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={loadData}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── List ── */}
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={s.loaderText}>Syncing team…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EmployeeCard
              item={item}
              currentEmployee={currentEmployee}
              onDeactivate={handleDeactivate}
            />
          )}
          contentContainerStyle={[s.list, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          onRefresh={loadData}
          refreshing={loading}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="people-outline" size={40} color="#CBD5E1" />
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

// ── Card styles ───────────────────────────────────────────────
const c = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8ECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 17, fontWeight: '800' },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 14, fontWeight: '700', color: '#0F1D3A', flexShrink: 1 },
  rolePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  meta: { fontSize: 12, color: '#8A9BB5', fontWeight: '500', marginBottom: 2 },
  email: { fontSize: 11, color: '#94A3B8' },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#FEF2F2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

// ── Screen styles ─────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: C.navy, letterSpacing: -0.4 },
  sub: { fontSize: 12, color: C.muted, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    gap: 8,
  },
  searchInput: { flex: 1, color: C.navy, fontSize: 13, fontWeight: '500' },

  errorCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: { flex: 1, color: '#991B1B', fontSize: 12, fontWeight: '600' },
  retryBtn: { backgroundColor: C.white, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  retryText: { color: C.navy, fontSize: 12, fontWeight: '700' },

  list: { paddingHorizontal: 20, paddingTop: 4 },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: C.subtle, fontSize: 13 },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, color: C.subtle, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});