import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// Hooks
import { useDailyLogs } from '@/hooks/useDailyLogs';

const COLORS = {
  navy: '#0F172A',
  navyMid: '#1E293B',
  accent: '#6366F1',
  teal: '#10B981',
  rose: '#F43F5E',
  bg: '#F8FAFC',
  subtle: '#64748B',
  white: '#FFFFFF',
};

export default function DailyLogsScreen() {
  const {
    date,
    setDate,
    showPicker,
    setShowPicker,
    loading,
    refreshing,
    logs,
    onRefresh,
    correctRecord
  } = useDailyLogs();

  const [editingLog, setEditingLog] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const openCorrection = (item: any) => {
    setEditingLog(item);
    // Assuming checkin/checkout are ISO strings or similar in the 'logs' array from backend
    // But previous view of daily-logs.tsx showed item.checkin as "09:00" etc.
    // In actual production, we need full date strings.
    // Let's use what's available or set current date time.
    setCheckin(item.checkinAt || ''); 
    setCheckout(item.checkoutAt || '');
    setModalVisible(true);
  };

  const handleSaveCorrection = async () => {
    try {
      await correctRecord(editingLog.id, {
        checkinTime: checkin || undefined,
        checkoutTime: checkout || undefined,
      });
      setModalVisible(false);
      Alert.alert('Success', 'Attendance record updated');
    } catch (e) {
      Alert.alert('Error', 'Failed to update record');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={s.card}>
      <View style={s.cardMain}>
        <View style={[s.indicator, { backgroundColor: item.color || COLORS.accent }]} />
        <View style={s.empInfo}>
          <Text style={s.empName}>{item.name}</Text>
          <Text style={s.empRole}>{item.designation}</Text>
        </View>
        <View style={s.statusBadge}>
           <Text style={[s.statusText, { color: item.color || COLORS.accent }]}>{item.status}</Text>
        </View>
        <TouchableOpacity style={s.editBtn} onPress={() => openCorrection(item)}>
          <Ionicons name="create-outline" size={18} color={COLORS.subtle} />
        </TouchableOpacity>
      </View>
      
      <View style={s.timeRow}>
        <View style={s.timeItem}>
          <Ionicons name="enter-outline" size={14} color={COLORS.subtle} />
          <Text style={s.timeLabel}>In:</Text>
          <Text style={s.timeVal}>{item.checkin}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.timeItem}>
          <Ionicons name="exit-outline" size={14} color={COLORS.subtle} />
          <Text style={s.timeLabel}>Out:</Text>
          <Text style={s.timeVal}>{item.checkout}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={[COLORS.navy, COLORS.navyMid]} style={s.header}>
        <SafeAreaView>
          <View style={s.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
               <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={s.headerTitle}>Daily Logs</Text>
              <Text style={s.headerSub}>Monitoring team attendance</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={s.datePickerBtn} 
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.accent} />
            <Text style={s.dateLabel}>{format(date, 'EEEE, dd MMMM yyyy')}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.subtle} />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {loading && !refreshing ? (
        <View style={s.center}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={s.loadingText}>Syncing records...</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item, idx) => item.id || idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="document-text-outline" size={64} color="#e2e8f0" />
              <Text style={s.emptyText}>No records found for this date.</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Manual Correction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.navy} />
              </TouchableOpacity>
            </View>
            
            <Text style={s.modalSub}>Editing record for {editingLog?.name}</Text>

            <View style={s.inputGroup}>
              <Text style={s.label}>Check-in Time (ISO)</Text>
              <TextInput 
                style={s.input} 
                value={checkin} 
                onChangeText={setCheckin} 
                placeholder="e.g. 2024-03-20T09:00:00Z"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Check-out Time (ISO)</Text>
              <TextInput 
                style={s.input} 
                value={checkout} 
                onChangeText={setCheckout} 
                placeholder="e.g. 2024-03-20T18:00:00Z"
              />
            </View>

            <TouchableOpacity style={s.saveBtn} onPress={handleSaveCorrection}>
              <Text style={s.saveText}>Save Correction</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginTop: 2 },
  
  datePickerBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    marginTop: 24, 
    padding: 16, 
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4
  },
  dateLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.navy },
  
  list: { padding: 20, paddingBottom: 60 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    marginBottom: 16, 
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  indicator: { width: 4, height: 32, borderRadius: 2, marginRight: 12 },
  empInfo: { flex: 1 },
  empName: { fontSize: 16, fontWeight: '700', color: COLORS.navy },
  empRole: { fontSize: 12, color: COLORS.subtle, marginTop: 2, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#f8fafc' },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  
  timeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc', 
    borderRadius: 16, 
    padding: 12 
  },
  timeItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  divider: { width: 1, height: 20, backgroundColor: '#e2e8f0' },
  timeLabel: { fontSize: 12, color: COLORS.subtle, fontWeight: '500' },
  timeVal: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.subtle, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80, opacity: 0.8 },
  emptyText: { marginTop: 16, color: COLORS.subtle, fontSize: 14, fontWeight: '600' },

  editBtn: { marginLeft: 12, width: 34, height: 34, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.navy },
  modalSub: { fontSize: 14, color: COLORS.subtle, marginBottom: 24, fontWeight: '500' },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.navy, marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, color: COLORS.navy, borderWidth: 1, borderColor: '#e2e8f0' },
  
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 12, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
