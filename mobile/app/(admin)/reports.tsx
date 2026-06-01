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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceApi.getCompanyStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const [downloading, setDownloading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      await reportsApi.downloadMonthlyReport(selectedYear, selectedMonth);
    } catch (e) {
      alert('Failed to download Excel report.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await reportsApi.downloadMonthlyPDF(selectedYear, selectedMonth);
    } catch (e) {
      alert('Failed to download PDF report.');
    } finally {
      setDownloadingPdf(false);
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

        <View style={s.grid}>
          <StatCard 
            title="Attendance" 
            value={`${Math.round(stats.overallAttendance)}%`} 
            icon="people" 
            colors={[C.accent, '#3B82F6']}
            sub={`${stats.present} / ${stats.total} Present Today`}
          />
          <StatCard 
            title="Avg. Workflow" 
            value={`${stats.avgWorkHours}h`} 
            icon="time" 
            colors={['#8B5CF6', '#7C3AED']}
            sub="Average daily productive time"
          />
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Performance Trends</Text>
            <TouchableOpacity><Text style={s.viewAll}>Details</Text></TouchableOpacity>
          </View>
          
          <View style={s.chartCard}>
             <View style={s.chartInfo}>
                <View>
                   <Text style={s.chartLabel}>ON-TIME RATE</Text>
                   <Text style={s.chartValue}>92.4%</Text>
                </View>
                <View style={s.trendBadge}>
                   <Ionicons name="caret-up" size={12} color={C.teal} />
                   <Text style={s.trendText}>3.2%</Text>
                </View>
             </View>
             
             {/* Mock Chart Visualization with Views */}
             <View style={s.barContainer}>
                {[45, 60, 35, 80, 55, 90, 70].map((h, i) => (
                  <View key={i} style={s.barGroup}>
                    <View style={[s.bar, { height: h }, i === 5 && { backgroundColor: C.accent }]} />
                    <Text style={s.barDate}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                  </View>
                ))}
             </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Data Exports</Text>
          <View style={s.exportCard}>
             <View style={s.exportHeader}>
                <Ionicons name="cloud-download-outline" size={24} color={C.navy} />
                <View>
                   <Text style={s.exportTitle}>Monthly Attendance Sheet</Text>
                   <Text style={s.exportSub}>Generated as professional .xlsx</Text>
                </View>
             </View>

             <View style={s.pickerRow}>
                <View style={s.pickerBox}>
                   <Text style={s.pickerLabel}>MONTH</Text>
                   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillScroll}>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <TouchableOpacity 
                          key={m} 
                          onPress={() => setSelectedMonth(m)}
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
                   style={[s.downloadBtn, s.excelBtn, downloading && s.disabled]} 
                   onPress={handleDownloadExcel}
                   disabled={downloading || downloadingPdf}
                >
                   {downloading ? (
                      <ActivityIndicator color={C.white} size="small" />
                   ) : (
                      <>
                        <Ionicons name="grid-outline" size={18} color={C.white} />
                        <Text style={s.downloadText}>Excel</Text>
                      </>
                   )}
                </TouchableOpacity>

                <TouchableOpacity 
                   style={[s.downloadBtn, s.pdfBtn, downloadingPdf && s.disabled]} 
                   onPress={handleDownloadPdf}
                   disabled={downloading || downloadingPdf}
                >
                   {downloadingPdf ? (
                      <ActivityIndicator color={C.white} size="small" />
                   ) : (
                      <>
                        <Ionicons name="document-outline" size={18} color={C.white} />
                        <Text style={s.downloadText}>PDF</Text>
                      </>
                   )}
                </TouchableOpacity>
             </View>
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
  barContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingTop: 10 },
  barGroup: { alignItems: 'center', gap: 8 },
  bar: { width: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  barDate: { fontSize: 10, fontWeight: '700', color: C.subtle },
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
  disabled: { opacity: 0.6 }
});

export default AdminReportsScreen;
