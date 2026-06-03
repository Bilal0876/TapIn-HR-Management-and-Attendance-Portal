import { useState, useCallback, useEffect } from 'react';
import { attendanceApi } from '../features/attendance/api';

export const useDailyLogs = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = useCallback(async (selectedDate: Date) => {
    setLoading(true);
    try {
      const data = await attendanceApi.getDailyLogs(selectedDate);
      setLogs(data);
    } catch (e) {
      console.error('Fetch logs error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs(date);
    setRefreshing(false);
  }, [date, fetchLogs]);

  useEffect(() => {
    fetchLogs(date);
  }, [date, fetchLogs]);

  return {
    date,
    setDate,
    showPicker,
    setShowPicker,
    loading,
    refreshing,
    logs,
    onRefresh
  };
};
