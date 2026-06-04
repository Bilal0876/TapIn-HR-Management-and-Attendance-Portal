import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Modal, TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useShifts } from '@/hooks/useShifts';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const C = {
  navy: '#0D1B2A',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0D1B2A',
  sub: '#64748B',
  accent: '#6366F1',
  teal: '#0D9488',
  rose: '#E11D48',
  amber: '#F59E0B',
  white: '#FFFFFF',
};

export default function ShiftSettingsScreen() {
  const { shifts, loading, refreshing, onRefresh, createShift, updateShift, deleteShift } = useShifts();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [checkinHour, setCheckinHour] = useState('09');
  const [checkinMin, setCheckinMin] = useState('00');
  const [workMin, setWorkMin] = useState('480');
  const [breakMin, setBreakMin] = useState('60');
  const [graceMin, setGraceMin] = useState('15');

  const openModal = (shift?: any) => {
    if (shift) {
      setEditingShift(shift);
      setName(shift.name);
      setCheckinHour(String(shift.expectedCheckinHour).padStart(2, '0'));
      setCheckinMin(String(shift.expectedCheckinMinute).padStart(2, '0'));
      setWorkMin(String(shift.workMinutesPerDay));
      setBreakMin(String(shift.breakMinutesAllocated));
      setGraceMin(String(shift.gracePeriodMinutes));
    } else {
      setEditingShift(null);
      setName('');
      setCheckinHour('09');
      setCheckinMin('00');
      setWorkMin('480');
      setBreakMin('60');
      setGraceMin('15');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Please enter a name');

    const data = {
      name,
      expectedCheckinHour: parseInt(checkinHour),
      expectedCheckinMinute: parseInt(checkinMin),
      workMinutesPerDay: parseInt(workMin),
      breakMinutesAllocated: parseInt(breakMin),
      gracePeriodMinutes: parseInt(graceMin),
    };

    try {
      if (editingShift) {
        await updateShift(editingShift.id, data);
      } else {
        await createShift(data);
      }
      setModalVisible(false);
    } catch (e) {
      // Error handled in hook
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Shift',
      'Are you sure you want to delete this shift profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteShift(id) }
      ]
    );
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={[C.navy, '#1E293B']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={s.headerTitleWrap}>
              <Text style={s.headerTitle}>Workplace Rules</Text>
              <Text style={s.headerSubtitle}>Manage shifts & schedules</Text>
            </View>
            <TouchableOpacity onPress={() => openModal()} style={s.addBtn}>
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />
        ) : shifts.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="calendar-outline" size={48} color={C.border} />
            <Text style={s.emptyText}>No shift profiles created yet</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => openModal()}>
              <Text style={s.emptyBtnText}>Create First Shift</Text>
            </TouchableOpacity>
          </View>
        ) : (
          shifts.map((shift) => (
            <View key={shift.id} style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.cardTitleWrap}>
                  <Text style={s.cardName}>{shift.name}</Text>
                  {shift.isDefault && <View style={s.defaultBadge}><Text style={s.defaultText}>DEFAULT</Text></View>}
                </View>
                <View style={s.cardActions}>
                  <TouchableOpacity onPress={() => openModal(shift)} style={s.actionBtn}>
                    <Ionicons name="pencil" size={18} color={C.sub} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(shift.id)} style={s.actionBtn}>
                    <Ionicons name="trash-outline" size={18} color={C.rose} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={s.cardBody}>
                <View style={s.statRow}>
                  <View style={s.stat}>
                    <Ionicons name="time-outline" size={14} color={C.accent} />
                    <Text style={s.statLabel}>Check-in: </Text>
                    <Text style={s.statValue}>{String(shift.expectedCheckinHour).padStart(2, '0')}:{String(shift.expectedCheckinMinute).padStart(2, '0')}</Text>
                  </View>
                  <View style={s.stat}>
                    <Ionicons name="hourglass-outline" size={14} color={C.teal} />
                    <Text style={s.statLabel}>Duration: </Text>
                    <Text style={s.statValue}>{Math.floor(shift.workMinutesPerDay / 60)}h {shift.workMinutesPerDay % 60}m</Text>
                  </View>
                </View>
                <View style={s.statRow}>
                  <View style={s.stat}>
                    <Ionicons name="cafe-outline" size={14} color={C.amber} />
                    <Text style={s.statLabel}>Break: </Text>
                    <Text style={s.statValue}>{shift.breakMinutesAllocated}m</Text>
                  </View>
                  <View style={s.stat}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={C.rose} />
                    <Text style={s.statLabel}>Grace: </Text>
                    <Text style={s.statValue}>{shift.gracePeriodMinutes}m</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingShift ? 'Edit Shift' : 'New Shift Profile'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
              <View style={s.inputGroup}>
                <Text style={s.label}>Profile Name</Text>
                <TextInput
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Morning Shift"
                  placeholderTextColor={C.sub}
                />
              </View>

              <View style={s.row}>
                <View style={[s.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={s.label}>Check-in Hour (00-23)</Text>
                  <TextInput
                    style={s.input}
                    value={checkinHour}
                    onChangeText={setCheckinHour}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  <Text style={s.label}>Check-in Min (00-59)</Text>
                  <TextInput
                    style={s.input}
                    value={checkinMin}
                    onChangeText={setCheckinMin}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Daily Work Minutes</Text>
                <TextInput
                  style={s.input}
                  value={workMin}
                  onChangeText={setWorkMin}
                  keyboardType="numeric"
                  placeholder="e.g. 480"
                />
                <Text style={s.hint}>Standard 8h = 480 mins</Text>
              </View>

              <View style={s.row}>
                <View style={[s.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={s.label}>Break (mins)</Text>
                  <TextInput
                    style={s.input}
                    value={breakMin}
                    onChangeText={setBreakMin}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  <Text style={s.label}>Grace (mins)</Text>
                  <TextInput
                    style={s.input}
                    value={graceMin}
                    onChangeText={setGraceMin}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
              <Text style={s.saveBtnText}>{editingShift ? 'Update Profile' : 'Create Profile'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent },

  list: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName: { fontSize: 16, fontWeight: '700', color: C.text },
  defaultBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultText: { fontSize: 9, fontWeight: '800', color: C.accent },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 4 },

  cardBody: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 14, gap: 10 },
  statRow: { flexDirection: 'row', gap: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  statLabel: { fontSize: 12, color: C.sub },
  statValue: { fontSize: 12, fontWeight: '700', color: C.text },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 14, color: C.sub, marginTop: 12, marginBottom: 20 },
  emptyBtn: { backgroundColor: C.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#FFF', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  modalBody: { marginBottom: 20 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: C.sub, marginBottom: 8 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 10, padding: 12, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.border },
  row: { flexDirection: 'row' },
  hint: { fontSize: 11, color: C.sub, marginTop: 4, marginLeft: 4 },

  saveBtn: { backgroundColor: C.accent, borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
