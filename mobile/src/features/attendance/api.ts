import { apiClient } from '@/lib/axios';

export const attendanceApi = {
  getToday: async () => {
    const res = await apiClient.get('/attendance/today');
    return res.data.record;
  },
  checkin: async () => {
    const res = await apiClient.post('/attendance/checkin', {});
    return res.data;
  },
  checkout: async () => {
    const res = await apiClient.post('/attendance/checkout', {});
    return res.data;
  },
  startBreak: async () => {
    const res = await apiClient.post('/attendance/breaks/start', {});
    return res.data;
  },
  endBreak: async () => {
    const res = await apiClient.post('/attendance/breaks/end', {});
    return res.data;
  },
  getHistory: async () => {
    const res = await apiClient.get('/attendance/history');
    return res.data;
  },
  getPersonalStats: async () => {
    const res = await apiClient.get('/attendance/stats/personal');
    return res.data;
  },
  getCompanyStats: async () => {
    const res = await apiClient.get('/attendance/stats/company');
    return res.data;
  },
  getCompanyShiftSettings: async () => {
    const res = await apiClient.get('/attendance/settings/company-shift');
    return res.data as {
      shiftStart: string;
      shiftEnd: string;
      breakMinutesAllocated: number;
      gracePeriodMinutes: number;
      workMinutesPerDay: number;
    };
  },
  updateCompanyShiftSettings: async (data: {
    shiftStart: string;
    shiftEnd: string;
    breakMinutesAllocated: number;
    gracePeriodMinutes: number;
  }) => {
    const res = await apiClient.put('/attendance/settings/company-shift', data);
    return res.data;
  },
  getCompanyTrend: async (days = 7) => {
    const res = await apiClient.get(`/attendance/stats/company-trend?days=${days}`);
    return res.data as {
      trend: Array<{
        date: string;
        dayLabel: string;
        attendanceRate: number;
        onTimeRate: number;
        present: number;
        total: number;
        avgWorkHours: number;
      }>;
      latestOnTimeRate: number;
      onTimeDelta: number;
    };
  },
  getMyCorrections: async () => {
    const res = await apiClient.get('/corrections/my-requests');
    return res.data;
  },
}
