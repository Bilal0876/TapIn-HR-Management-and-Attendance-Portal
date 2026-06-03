import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../features/auth/store';
import { apiClient } from '../lib/axios';
import { useSocket } from './useSocket';

export interface AdminStats {
  overallAttendance: number;
  present: number;
  total: number;
  absent: number;
  avgWorkHours: number | string;
}

export interface PulseActivity {
  id?: string;
  name: string;
  action: string;
  time: string;
  icon: string;
  color: string;
}

export const useAdminDashboard = () => {
  const employee = useAuthStore((s) => s.employee);
  const [stats, setStats] = useState<AdminStats>({ 
    overallAttendance: 0, 
    present: 0, 
    total: 0, 
    absent: 0, 
    avgWorkHours: 0 
  });
  const [pulse, setPulse] = useState<PulseActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get('/attendance/stats/company');
      const data = res.data;
      setStats({
        overallAttendance: data.overallAttendance ?? 0,
        present: data.present ?? 0,
        total: data.total ?? 0,
        absent: (data.total ?? 0) - (data.present ?? 0),
        avgWorkHours: data.avgWorkHours ?? 0,
      });
    } catch (e) {
      console.error('Stats fetch error:', e);
    }
  }, []);

  const fetchPulse = useCallback(async () => {
    try {
      const res = await apiClient.get('/attendance/stats/company-pulse');
      setPulse(res.data ?? []);
    } catch (e) {
      console.error('Pulse fetch error:', e);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchPulse()]);
    setLoading(false);
  }, [fetchStats, fetchPulse]);

  // Real-time pulse updates
  useSocket('activity_pulse', (activity: PulseActivity) => {
    setPulse(prev => [activity, ...prev].slice(0, 15));
    fetchStats(); // Update stats in real-time when activity happens
  });

  useEffect(() => {
    if (employee?.role === 'ADMIN' || employee?.role === 'SUPER_ADMIN') {
      init();
    }
  }, [employee, init]);

  const onRefresh = async () => {
    setRefreshing(true);
    await init();
    setRefreshing(false);
  };

  return {
    stats,
    pulse,
    loading,
    refreshing,
    onRefresh,
    employee
  };
};
