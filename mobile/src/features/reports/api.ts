import * as FileSystem from 'expo-file-system';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '../auth/store';
import { Platform } from 'react-native';

// Defensive import for Sharing to prevent top-level crash
let Sharing: any = null;
try {
  Sharing = require('expo-sharing');
} catch (e) {
  console.warn('ExpoSharing native module not found');
}

export const reportsApi = {
  downloadMonthlyReport: async (year: number, month: number) => {
    const token = useAuthStore.getState().token;
    const filename = `attendance-${year}-${month}.xlsx`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    
    // We use FileSystem.downloadAsync because it handles auth headers and direct-to-file streaming better on mobile
    const downloadUrl = `${apiClient.defaults.baseURL}/reports/monthly?year=${year}&month=${month}`;

    try {
      const result = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.status !== 200) {
        throw new Error('Failed to download report');
      }

      // Open sharing dialog
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: `Monthly Attendance - ${month}/${year}`,
          UTI: 'com.microsoft.excel.xlsx',
        });
      }
      
      return result.uri;
    } catch (e) {
      console.error('Download error:', e);
      throw e;
    }
  },

  downloadMonthlyPDF: async (year: number, month: number) => {
    const token = useAuthStore.getState().token;
    const filename = `attendance-${year}-${month}.pdf`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    
    const downloadUrl = `${apiClient.defaults.baseURL}/reports/monthly-pdf?year=${year}&month=${month}`;

    try {
      const result = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.status !== 200) {
        throw new Error('Failed to download report');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Monthly Attendance PDF - ${month}/${year}`,
        });
      }
      
      return result.uri;
    } catch (e) {
      console.error('Download error:', e);
      throw e;
    }
  },
};
