import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { attendanceApi } from '@/features/attendance/api';
import { reportsApi } from '@/features/reports/api';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const C = {
  navy: '#0F1D3A',
  accent: '#5BA3F5',
  teal: '#1DB8A0',
  white: '#FFFFFF',
  subtle: '#8A9BB5',
  bg: '#F8FAFC',
  gold: '#F59E0B',
};

function StatCard({ title, value, icon, colors, sub }: any) {
  return (
    <LinearGradient colors={colors} start={{x:0, y:0}} end={{x:1, y:1}} style={s.statCard}>
      <View style={s.statHeader}>
        <View style={s.statIconBox}>
          <Ionicons name={icon} size={20} color={C.white} />
        </View>
        <Text style={s.statVal}>{value}</Text>
      </View>
      <Text style={s.statTitle}>{title}</Text>
      <Text style={s.statSub}>{sub}</Text>
    </LinearGradient>
  );
}

function AdminReportsScreen() {
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [trendMeta, setTrendMeta] = useState<{ latestOnTimeRate: number; onTimeDelta: number }>({
    latestOnTimeRate: 0,
    onTimeDelta: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setLoadingError(null);
    try {
      const [statsRes, trendRes] = await Promise.all([
        attendanceApi.getCompanyStats(),
        attendanceApi.getCompanyTrend(7),
      ]);
      setStats(statsRes);
      setTrend(trendRes.trend || []);
      setTrendMeta({
        latestOnTimeRate: trendRes.latestOnTimeRate || 0,
        onTimeDelta: trendRes.onTimeDelta || 0,
      });
    } catch (e) {
      setLoadingError('Could not load report insights. Pull down or retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const [downloading, setDownloading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [excelUri, setExcelUri] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const ensureShareableFileUri = async (uri: string, extension: '.xlsx' | '.pdf') => {
    if (uri.startsWith('file://')) return uri;

    if (uri.startsWith('content://')) {
      const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      if (!baseDir) {
        throw new Error('No writable directory available for sharing.');
      }

      const targetUri = `${baseDir}shared-${selectedYear}-${selectedMonth}-${Date.now()}${extension}`;
      await FileSystem.copyAsync({ from: uri, to: targetUri });
      return targetUri;
    }

    throw new Error(`Unsupported URI scheme for sharing: ${uri}`);
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    setExcelUri(null);
    setStatusMsg('Downloading Excel...');
    try {
      const uri = await reportsApi.downloadMonthlyReport(selectedYear, selectedMonth);
      setExcelUri(uri);
      setStatusMsg('Excel ready! Tap "Open" to view.');
    } catch (e) {
      setStatusMsg('Excel download failed.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setPdfUri(null);
    setStatusMsg('Downloading PDF...');
    try {
      const uri = await reportsApi.downloadMonthlyPDF(selectedYear, selectedMonth);
      setPdfUri(uri);
      setStatusMsg('PDF ready! Tap "Open" to view.');
    } catch (e) {
      setStatusMsg('PDF download failed.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleOpenExcel = async () => {
    if (!excelUri || sharing) return;
    setSharing(true);
    try {
      const shareableUri = await ensureShareableFileUri(excelUri, '.xlsx');
      await Sharing.shareAsync(shareableUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Monthly Attendance Excel',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } catch (e) {
      console.error('Sharing Error:', e);
      setStatusMsg('Could not open Excel.');
    } finally {
      setTimeout(() => setSharing(false), 2000);
    }
  };

  const handleOpenPdf = async () => {
    if (!pdfUri || sharing) return;
    setSharing(true);
    try {
      const shareableUri = await ensureShareableFileUri(pdfUri, '.pdf');
      await Sharing.shareAsync(shareableUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Monthly Attendance PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (e) {
      console.error('Sharing Error:', e);
      setStatusMsg('Could not open PDF.');
    } finally {
      setTimeout(() => setSharing(false), 2000);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator color={C.accent} /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Command Center</Text>
          <Text style={s.headerSub}>Company performance overview</Text>
        </View>

        {loadingError ? (
          <View style={s.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={s.errorText}>{loadingError}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={loadDashboard}>
              <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <View style={s.grid}>
          <StatCard 
            title="Attendance" 
            value={`${Math.round(stats?.overallAttendance ?? 0)}%`} 
            icon="people" 
            colors={[C.accent, '#3B82F6']}
            sub={`${stats?.present ?? 0} / ${stats?.total ?? 0} Present Today`}
          />
          <StatCard 
            title="Avg. Workflow" 
            value={`${stats?.avgWorkHours ?? 0}h`} 
            icon="time" 
            colors={['#8B5CF6', '#7C3AED']}
            sub="Average daily productive time"
          />
        </View>
        )}

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Performance Trends</Text>
          </View>
          
          <View style={s.chartCard}>
             <View style={s.chartInfo}>
                <View>
                   <Text style={s.chartLabel}>ON-TIME RATE</Text>
                   <Text style={s.chartValue}>{trendMeta.latestOnTimeRate}%</Text>
                </View>
                <View style={[s.trendBadge, trendMeta.onTimeDelta < 0 && s.trendBadgeDown]}>
                   <Ionicons
                     name={trendMeta.onTimeDelta >= 0 ? 'caret-up' : 'caret-down'}
                     size={12}
                     color={trendMeta.onTimeDelta >= 0 ? C.teal : '#EF4444'}
                   />
                   <Text style={[s.trendText, trendMeta.onTimeDelta < 0 && s.trendTextDown]}>
                     {Math.abs(trendMeta.onTimeDelta)}%
                   </Text>
                </View>
             </View>
             
             <View style={s.barContainer}>
                {(trend.length ? trend : Array.from({ length: 7 }).map((_, i) => ({
                  attendanceRate: 0,
                  dayLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                }))).map((item, i) => {
                  const barHeight = Math.max(14, Math.round((item.attendanceRate || 0) * 1));
                  const isToday = i === (trend.length ? trend.length - 1 : -1);
                  return (
                    <View key={`${item.dayLabel}-${i}`} style={s.barGroup}>
                      <View style={[s.bar, { height: barHeight }, isToday && { backgroundColor: C.accent }]} />
                      <Text style={s.barDate}>{item.dayLabel?.slice(0, 1) || '-'}</Text>
                    </View>
                  );
                })}
             </View>
             <Text style={s.chartFootnote}>
               {trend.length ? 'Last 7 days attendance rate (%)' : 'No attendance data yet for this period.'}
             </Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Data Exports</Text>
          <View style={s.exportCard}>
             <View style={s.exportHeader}>
                <Ionicons name="cloud-download-outline" size={24} color={C.navy} />
                <View>
                   <Text style={s.exportTitle}>Monthly Attendance Sheet</Text>
                   <Text style={s.exportSub}>Generated as professional .xlsx &amp; .pdf</Text>
                </View>
             </View>

             <View style={s.pickerRow}>
                <View style={s.pickerBox}>
                   <Text style={s.pickerLabel}>MONTH</Text>
                   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillScroll}>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <TouchableOpacity 
                          key={m} 
                          onPress={() => { 
                            setSelectedMonth(m); 
                            setExcelUri(null); 
                            setPdfUri(null); 
                            setStatusMsg(null);
                          }}
                          style={[s.pill, selectedMonth === m && s.pillActive]}
                        >
                           <Text style={[s.pillText, selectedMonth === m && s.pillTextActive]}>
                              {format(new Date(2025, m-1), 'MMM')}
                           </Text>
                        </TouchableOpacity>
                      ))}
                   </ScrollView>
                </View>
             </View>

              <View style={s.btnRow}>
                <TouchableOpacity
                   style={[s.downloadBtn, s.excelBtn, (downloading || downloadingPdf) && s.disabled]} 
                   onPress={excelUri ? handleOpenExcel : handleDownloadExcel}
                   disabled={downloading || downloadingPdf}
                >
                   {downloading ? (
                      <ActivityIndicator color={C.white} size="small" />
                   ) : (
                      <>
                        <Ionicons name={excelUri ? 'open-outline' : 'download-outline'} size={18} color={C.white} />
                        <Text style={s.downloadText}>{excelUri ? 'Open Excel' : 'Download Excel'}</Text>
                      </>
                   )}
                </TouchableOpacity>

                <TouchableOpacity 
                   style={[s.downloadBtn, s.pdfBtn, (downloading || downloadingPdf) && s.disabled]} 
                   onPress={pdfUri ? handleOpenPdf : handleDownloadPdf}
                   disabled={downloading || downloadingPdf}
                >
                   {downloadingPdf ? (
                      <ActivityIndicator color={C.white} size="small" />
                   ) : (
                      <>
                        <Ionicons name={pdfUri ? 'open-outline' : 'download-outline'} size={18} color={C.white} />
                        <Text style={s.downloadText}>{pdfUri ? 'Open PDF' : 'Download PDF'}</Text>
                      </>
                   )}
                </TouchableOpacity>
             </View>

             {statusMsg && (
               <View style={s.statusContainer}>
                 <Text style={s.statusText}>{statusMsg}</Text>
               </View>
             )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 120 },
  header: { padding: 24, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: C.subtle, marginTop: 4, fontWeight: '500' },
  errorCard: {
    marginHorizontal: 20,
    marginTop: 8,
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
  grid: { flexDirection: 'row', paddingHorizontal: 20, gap: 16 },
  statCard: { flex: 1, borderRadius: 28, padding: 20, shadowColor: C.navy, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: C.white },
  statTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 },
  statSub: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '600' },
  section: { marginTop: 32, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.navy },
  viewAll: { fontSize: 13, fontWeight: '600', color: C.accent },
  chartCard: { backgroundColor: C.white, borderRadius: 24, padding: 24, elevation: 2 },
  chartInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  chartLabel: { fontSize: 11, fontWeight: '700', color: C.subtle, letterSpacing: 0.5 },
  chartValue: { fontSize: 24, fontWeight: '800', color: C.navy, marginTop: 4 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  trendText: { fontSize: 11, fontWeight: '800', color: C.teal },
  trendBadgeDown: { backgroundColor: '#FEF2F2' },
  trendTextDown: { color: '#EF4444' },
  barContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingTop: 10 },
  barGroup: { alignItems: 'center', gap: 8 },
  bar: { width: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  barDate: { fontSize: 10, fontWeight: '700', color: C.subtle },
  chartFootnote: { marginTop: 12, fontSize: 11, color: C.subtle, fontWeight: '500' },
  userRate: { fontSize: 16, fontWeight: '800', color: C.navy },
  exportCard: { backgroundColor: C.white, borderRadius: 24, padding: 20, marginTop: 12, elevation: 2 },
  exportHeader: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 20 },
  exportTitle: { fontSize: 15, fontWeight: '700', color: C.navy },
  exportSub: { fontSize: 12, color: C.subtle, marginTop: 2 },
  pickerRow: { marginBottom: 20 },
  pickerBox: { gap: 10 },
  pickerLabel: { fontSize: 10, fontWeight: '700', color: C.subtle, letterSpacing: 0.5 },
  pillScroll: { gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: C.bg, borderWidth: 1, borderColor: '#E2E8F0' },
  pillActive: { backgroundColor: C.navy, borderColor: C.navy },
  pillText: { fontSize: 12, fontWeight: '600', color: C.navy },
  pillTextActive: { color: C.white },
  btnRow: { flexDirection: 'row', gap: 12 },
  downloadBtn: { flex: 1, borderRadius: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  excelBtn: { backgroundColor: C.teal },
  pdfBtn: { backgroundColor: '#EF4444' },
  downloadText: { color: C.white, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  statusContainer: { marginTop: 16, backgroundColor: C.bg, padding: 12, borderRadius: 12, alignItems: 'center' },
  statusText: { fontSize: 12, color: C.navy, fontWeight: '600' }
});

export default AdminReportsScreen;
