import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { correctionApi } from '@/features/corrections/api';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

export default function RequestCorrectionScreen() {
  const params = useLocalSearchParams<{
    recordId: string;
    date: string;
    checkinTime?: string;
    checkoutTime?: string;
  }>();

  const { recordId, date, checkinTime, checkoutTime } = params;

  // Pre-fill with actual record times when passed
  const defaultIn = checkinTime ? format(parseISO(checkinTime), 'HH:mm') : '09:00';
  const defaultOut = checkoutTime ? format(parseISO(checkoutTime), 'HH:mm') : '18:00';

  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [inTime, setInTime] = useState(defaultIn);
  const [outTime, setOutTime] = useState(defaultOut);

  const handleSubmit = useCallback(async () => {
    if (!reason.trim()) return Alert.alert('Error', 'Please provide a reason');
    if (!recordId || !date) return;

    setLoading(true);
    try {
      const datePart = (date as string).split('T')[0];
      const requestedIn = new Date(`${datePart}T${inTime}:00`);
      const requestedOut = new Date(`${datePart}T${outTime}:00`);

      await correctionApi.request({
        recordId: recordId as string,
        requestedCheckin: requestedIn.toISOString(),
        requestedCheckout: requestedOut.toISOString(),
        reason,
      });

      Alert.alert('Submitted', 'Your correction request has been sent for review.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [recordId, date, inTime, outTime, reason]);

  if (!recordId || !date) {
    return (
      <SafeAreaView className="flex-1 bg-[#F3F4F8] justify-center items-center px-8">
        <Ionicons name="alert-circle-outline" size={48} color="#E8405A" />
        <Text className="text-base font-bold text-[#0B0F17] mt-4 text-center">Record not found</Text>
        <Text className="text-sm text-[#96A0B5] mt-1 text-center">Please go back and try again.</Text>
        <TouchableOpacity
          className="mt-6 bg-[#5B6EF5] px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const displayDate = (() => {
    try { return format(parseISO(date as string), 'MMMM dd, yyyy'); }
    catch { return date as string; }
  })();

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F8]">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Header */}
        <View className="flex-row items-center px-6 py-6 gap-4">
          <TouchableOpacity
            className="w-11 h-11 rounded-xl bg-white justify-center items-center elevation-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0F1D3A" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-extrabold text-[#0B0F17]">Fix Record</Text>
            <Text className="text-sm font-medium text-[#96A0B5]">{displayDate}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>

          {/* Times card */}
          <View className="bg-white rounded-3xl p-5 mb-6 elevation-2">
            <Text className="text-lg font-bold text-[#0B0F17] mb-5">Requested Times</Text>

            <View className="flex-row items-end gap-3">
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-[#64748B] mb-2 tracking-wide">CHECK-IN</Text>
                <TextInput
                  className="bg-[#F3F4F8] border-[1.5px] border-[#E5E9F2] rounded-2xl p-4 text-[22px] font-extrabold text-[#0B0F17] text-center"
                  value={inTime}
                  onChangeText={setInTime}
                  placeholder="09:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
              <View className="pb-4">
                <Ionicons name="arrow-forward" size={20} color="#CBD5E1" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-[#64748B] mb-2 tracking-wide">CHECK-OUT</Text>
                <TextInput
                  className="bg-[#F3F4F8] border-[1.5px] border-[#E5E9F2] rounded-2xl p-4 text-[22px] font-extrabold text-[#0B0F17] text-center"
                  value={outTime}
                  onChangeText={setOutTime}
                  placeholder="18:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            </View>

            <View className="flex-row items-center gap-2 mt-4 bg-[#EEF0FE] p-3 rounded-xl">
              <Ionicons name="information-circle-outline" size={18} color="#5B6EF5" />
              <Text className="text-xs font-semibold text-[#5B6EF5]">
                Use 24-hour format (e.g. 14:30 for 2:30 PM)
              </Text>
            </View>
          </View>

          {/* Reason card */}
          <View className="bg-white rounded-3xl p-5 mb-6 elevation-2">
            <Text className="text-lg font-bold text-[#0B0F17] mb-5">Justification</Text>
            <Text className="text-[11px] font-bold text-[#64748B] mb-2 tracking-wide">
              REASON FOR CORRECTION
            </Text>
            <TextInput
              className="bg-[#F3F4F8] border-[1.5px] border-[#E5E9F2] rounded-2xl p-4 text-[15px] text-[#0B0F17] min-h-[120px]"
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Forgot to check out while leaving for an emergency meeting."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit button */}
          <TouchableOpacity
            className="bg-[#5B6EF5] rounded-2xl overflow-hidden elevation-4"
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center py-[18px] gap-2.5">
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white text-base font-extrabold">Submit for Review</Text>
                  <Ionicons name="send" size={18} color="#fff" />
                </>
              )}
            </View>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}