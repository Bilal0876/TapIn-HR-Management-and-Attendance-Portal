import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateLeave } from '@/features/leaves/hooks';
// Defensive import for DateTimePicker to prevent top-level crash
let DateTimePicker: any = null;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  console.warn('DateTimePicker native module not found');
}
import { format } from 'date-fns';

const C = {
  bg: '#F8FAFC',
  white: '#FFFFFF',
  navy: '#1E293B',
  gray: '#64748B',
  accent: '#6366F1',
  border: '#E2E8F0',
};

const LEAVE_TYPES = ['CASUAL', 'SICK', 'VACATION', 'OTHER'];

function RequestLeaveScreen() {
  const router = useRouter();
  const createLeave = useCreateLeave();
  
  const [type, setType] = useState('CASUAL');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const handleSubmit = async () => {
    if (reason.length < 5) return Alert.alert('Error', 'Please provide a reason (min 5 chars)');
    if (endDate < startDate) return Alert.alert('Error', 'End date cannot be before start date');

    try {
      await createLeave.mutateAsync({
        type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason
      });
      Alert.alert('Success', 'Leave request submitted!');
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to submit request');
    }
  };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: 'Request Leave', headerShown: true, headerBackTitle: 'Cancel' }} />
      
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.section}>
          <Text style={s.label}>Leave Type</Text>
          <View style={s.typeRow}>
            {LEAVE_TYPES.map(t => (
              <TouchableOpacity 
                key={t} 
                style={[s.typeBtn, type === t && s.typeBtnActive]}
                onPress={() => setType(t)}
              >
                <Text style={[s.typeText, type === t && s.typeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.label}>Start Date</Text>
          <TouchableOpacity style={s.datePicker} onPress={() => setShowStart(true)}>
            <Ionicons name="calendar-outline" size={20} color={C.accent} />
            <Text style={s.dateValue}>{format(startDate, 'PPP')}</Text>
          </TouchableOpacity>
          {showStart && (
            <DateTimePicker
              value={startDate}
              mode="date"
              onChange={(e, date) => { setShowStart(false); if (date) setStartDate(date); }}
            />
          )}
        </View>

        <View style={s.section}>
          <Text style={s.label}>End Date</Text>
          <TouchableOpacity style={s.datePicker} onPress={() => setShowEnd(true)}>
            <Ionicons name="calendar-outline" size={20} color={C.accent} />
            <Text style={s.dateValue}>{format(endDate, 'PPP')}</Text>
          </TouchableOpacity>
          {showEnd && (
            <DateTimePicker
              value={endDate}
              mode="date"
              onChange={(e, date) => { setShowEnd(false); if (date) setEndDate(date); }}
            />
          )}
        </View>

        <View style={s.section}>
          <Text style={s.label}>Reason for Leave</Text>
          <TextInput
            style={s.input}
            multiline
            placeholder="Please explain why you need leave..."
            placeholderTextColor={C.gray}
            value={reason}
            onChangeText={setReason}
          />
        </View>

        <TouchableOpacity 
          style={[s.submitBtn, createLeave.isPending && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={createLeave.isPending}
        >
          {createLeave.isPending ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={s.submitText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  scroll: { padding: 20 },
  section: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: C.gray, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  typeBtnActive: { backgroundColor: C.navy, borderColor: C.navy },
  typeText: { fontSize: 12, fontWeight: '600', color: C.navy },
  typeTextActive: { color: C.white },
  datePicker: { padding: 16, backgroundColor: C.bg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  dateValue: { fontSize: 16, color: C.navy, fontWeight: '600' },
  input: { padding: 16, backgroundColor: C.bg, borderRadius: 12, minHeight: 120, fontSize: 15, color: C.navy, textAlignVertical: 'top', borderWidth: 1, borderColor: C.border },
  submitBtn: { backgroundColor: C.accent, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  submitText: { color: C.white, fontSize: 16, fontWeight: '800' }
});

export default RequestLeaveScreen;
