import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { correctionApi } from '@/features/corrections/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
  label: '#64748B',
};

export default function RequestCorrectionScreen() {
  const { recordId, date } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  
  // Custom time inputs (HH:MM)
  const [inTime, setInTime] = useState('09:00');
  const [outTime, setOutTime] = useState('18:00');

  const handleSubmit = async () => {
    if (!reason.trim()) return Alert.alert('Error', 'Please provide a reason');
    
    setLoading(true);
    try {
      // Merge date from search params with the requested time
      const datePart = (date as string).split('T')[0];
      const requestedIn = new Date(`${datePart}T${inTime}:00`);
      const requestedOut = new Date(`${datePart}T${outTime}:00`);

      await correctionApi.request({
        recordId: recordId as string,
        requestedCheckin: requestedIn.toISOString(),
        requestedCheckout: requestedOut.toISOString(),
        reason
      });

      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.navy} />
          </TouchableOpacity>
          <View>
            <Text style={s.title}>Fix Record</Text>
            <Text style={s.sub}>{date ? format(parseISO(date as string), 'MMMM dd, yyyy') : ''}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.card}>
            <Text style={s.sectionTitle}>Requested Times</Text>
            
            <View style={s.timeRow}>
              <View style={s.timeInputGroup}>
                <Text style={s.label}>CHECK-IN</Text>
                <TextInput 
                  style={s.digitalInput} 
                  value={inTime} 
                  onChangeText={setInTime}
                  placeholder="09:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
              <View style={s.timeDivider}>
                <Ionicons name="arrow-forward" size={20} color="#CBD5E1" />
              </View>
              <View style={s.timeInputGroup}>
                <Text style={s.label}>CHECK-OUT</Text>
                <TextInput 
                  style={s.digitalInput} 
                  value={outTime} 
                  onChangeText={setOutTime}
                  placeholder="18:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={s.infobox}>
              <Ionicons name="information-circle-outline" size={18} color={C.accent} />
              <Text style={s.infoText}>Use 24-hour format (e.g. 14:30 for 2:30 PM)</Text>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.sectionTitle}>Justification</Text>
            <Text style={s.label}>REASON FOR CORRECTION</Text>
            <TextInput
              style={s.textArea}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Forgot to check out while leaving for an emergency meeting."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={[C.accent, '#3B82F6']}
              style={s.gradient}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <>
                  <Text style={s.submitText}>Submit for Review</Text>
                  <Ionicons name="send" size={18} color={C.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.white, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 24, fontWeight: '800', color: C.navy },
  sub: { fontSize: 14, color: C.subtle, fontWeight: '500' },
  content: { padding: 24 },
  card: { backgroundColor: C.white, borderRadius: 24, padding: 20, marginBottom: 24, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.navy, marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', color: C.label, marginBottom: 8, letterSpacing: 0.5 },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  timeInputGroup: { flex: 1 },
  digitalInput: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 22, 
    fontWeight: '800', 
    color: C.navy,
    textAlign: 'center'
  },
  timeDivider: { paddingBottom: 16 },
  infobox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12 },
  infoText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  textArea: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 15, 
    color: C.navy, 
    minHeight: 120 
  },
  submitBtn: { borderRadius: 18, overflow: 'hidden', elevation: 4 },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  submitText: { color: C.white, fontSize: 16, fontWeight: '800' }
});
