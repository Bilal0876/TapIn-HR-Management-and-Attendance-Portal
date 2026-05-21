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
  }
}
