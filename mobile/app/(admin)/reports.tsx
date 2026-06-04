import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar, Dimensions, TouchableOpacity, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

// UI Components
import { StatCard } from '@/components/ui/StatCard';

// Hooks
import { useAdminReports } from '@/hooks/useAdminReports';

const COLORS = {
  navy: '#0F172A',
  navyMid: '#1E293B',
  accent: '#6366F1',
  teal: '#10B981',
  orange: '#F59E0B',
  rose: '#F43F5E',
  bg: '#F8FAFC',
  subtle: '#64748B',
};

export default function AdminReportsScreen() {
  const {
    stats,
    trend,
    trendMeta,
    loading,
    downloading,
    downloadingPdf,
    excelUri,
    pdfUri,
    statusMsg,
    selectedMonth,
    setSelectedMonth,
    handleDownloadExcel,
    handleDownloadPdf,
    handleShare,
    onRefresh
  } = useAdminReports();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[COLORS.navy, COLORS.navyMid]} style={s.header}>
        <SafeAreaView>
          <View style={s.headerTitleRow}>
            <Text style={s.headerTitle}>Analytics Center</Text>
            <Text style={s.headerSubText}>Monthly performance insights</Text>
          </View>

          <View style={s.statsGrid}>
            <StatCard
              title="Attendance Rate"
              value={loading ? '--' : `${Math.round(stats?.overallAttendance ?? 0)}%`}
              icon="analytics"
              colors={['#6366F1', '#4F46E5']}
              subtitle={`${stats?.present ?? 0}/${stats?.total ?? 0} present today`}
              trend="+1.2%"
            />
            <StatCard
              title="Avg. Productive"
              value={loading ? '--' : `${stats?.avgWorkHours ?? 0}h`}
              icon="time"
              colors={['#10B981', '#059669']}
              subtitle="Team daily average"
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {/* Status Breakdown */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Daily Status Breakdown</Text>
          <View style={s.distributionCard}>
            <View style={s.distRatio}>
              <View style={[s.distBar, { flex: stats?.onTimeRate || 33, backgroundColor: COLORS.teal }]} />
              <View style={[s.distBar, { flex: stats?.lateRate || 33, backgroundColor: COLORS.orange || '#F59E0B' }]} />
              <View style={[s.distBar, { flex: stats?.absentRate || 34, backgroundColor: COLORS.rose }]} />
            </View>
            <View style={s.distLegend}>
              <View style={s.legendItem}>
                <View style={[s.dot, { backgroundColor: COLORS.teal }]} />
                <Text style={s.legendText}>On-Time</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.dot, { backgroundColor: COLORS.orange || '#F59E0B' }]} />
                <Text style={s.legendText}>Late</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.dot, { backgroundColor: COLORS.rose }]} />
                <Text style={s.legendText}>Absent</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trend Chart */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>7-Day Trend</Text>
          <View style={s.chartCard}>
            <View style={s.chartStats}>
              <View>
                <Text style={s.chartSub}>ON-TIME RATE</Text>
                <Text style={s.chartVal}>{trendMeta.latestOnTimeRate}%</Text>
              </View>
              <View style={[s.trendBadge, trendMeta.onTimeDelta < 0 && s.trendBadgeDown]}>
                <Ionicons
                  name={trendMeta.onTimeDelta >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={trendMeta.onTimeDelta >= 0 ? COLORS.teal : COLORS.rose}
                />
                <Text style={[s.trendText, trendMeta.onTimeDelta < 0 && s.trendTextDown]}>
                  {Math.abs(trendMeta.onTimeDelta)}%
                </Text>
              </View>
            </View>

            <View style={s.barChart}>
              {(trend.length ? trend : Array.from({ length: 7 }).map((_, i) => ({
                attendanceRate: 20,
                dayLabel: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
              }))).map((item, i) => {
                const barHeight = Math.max(12, Math.round((item.attendanceRate || 0) * 1.2));
                return (
                  <View key={i} style={s.barCol}>
                    <View style={[s.bar, { height: barHeight }, i === trend.length - 1 && { backgroundColor: COLORS.accent }]} />
                    <Text style={s.barLabel}>{item.dayLabel?.slice(0, 1)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Data Exports */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Generate Reports</Text>
          <View style={s.exportCard}>
            <View style={s.monthSelector}>
              <Text style={s.exportLabel}>SELECT MONTH</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.monthScroll}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setSelectedMonth(m)}
                    style={[s.monthPill, selectedMonth === m && s.monthPillActive]}
                  >
                    <Text style={[s.monthText, selectedMonth === m && s.monthTextActive]}>
                      {format(new Date(2025, m - 1), 'MMM')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={s.exportActions}>
              <TouchableOpacity
                style={[s.exportBtn, { backgroundColor: COLORS.teal }]}
                onPress={() => excelUri ? handleShare(excelUri, '.xlsx') : handleDownloadExcel()}
                disabled={downloading}
              >
                {downloading ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <Ionicons name={excelUri ? "share-social-outline" : "download-outline"} size={18} color="#FFF" />
                    <Text style={s.exportBtnText}>{excelUri ? 'Share Excel' : 'Export Excel'}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.exportBtn, { backgroundColor: COLORS.rose }]}
                onPress={() => pdfUri ? handleShare(pdfUri, '.pdf') : handleDownloadPdf()}
                disabled={downloadingPdf}
              >
                {downloadingPdf ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <Ionicons name={pdfUri ? "share-social-outline" : "download-outline"} size={18} color="#FFF" />
                    <Text style={s.exportBtnText}>{pdfUri ? 'Share PDF' : 'Export PDF'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {statusMsg && (
              <View style={s.statusMsg}>
                <Ionicons name="information-circle-outline" size={14} color={COLORS.navy} />
                <Text style={s.statusMsgText}>{statusMsg}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24
  },
  headerTitleRow: { marginTop: 12, marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSubText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12 },

  content: { paddingBottom: 130 },
  section: { marginTop: 32, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.navy, marginBottom: 16 },

  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  chartStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  chartSub: { fontSize: 10, fontWeight: '700', color: COLORS.subtle, letterSpacing: 0.5 },
  chartVal: { fontSize: 24, fontWeight: '800', color: COLORS.navy, marginTop: 4 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  trendText: { fontSize: 11, fontWeight: '800', color: COLORS.teal },
  trendBadgeDown: { backgroundColor: '#fef2f2' },
  trendTextDown: { color: COLORS.rose },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, paddingTop: 10 },
  barCol: { alignItems: 'center', gap: 8 },
  bar: { width: 10, borderRadius: 5, backgroundColor: '#f1f5f9' },
  barLabel: { fontSize: 10, fontWeight: '700', color: COLORS.subtle },

  distributionCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  distRatio: { height: 12, borderRadius: 6, backgroundColor: '#f1f5f9', flexDirection: 'row', overflow: 'hidden', marginBottom: 20 },
  distBar: { height: '100%' },
  distLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: '700', color: COLORS.navy },

  exportCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  monthSelector: { marginBottom: 24 },
  exportLabel: { fontSize: 10, fontWeight: '700', color: COLORS.subtle, letterSpacing: 0.5, marginBottom: 16 },
  monthScroll: { gap: 8 },
  monthPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  monthPillActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  monthText: { fontSize: 12, fontWeight: '600', color: COLORS.navy },
  monthTextActive: { color: '#FFF' },

  exportActions: { flexDirection: 'row', gap: 12 },
  exportBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  exportBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  statusMsg: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  statusMsgText: { fontSize: 12, color: COLORS.navy, fontWeight: '600' }
});
