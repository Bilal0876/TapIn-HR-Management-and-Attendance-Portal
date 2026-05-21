import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as Constants from 'expo-constants';
import { apiClient } from '@/lib/axios';

// Skip push notifications setup in Expo Go (SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';

export function usePushNotifications() {
  useEffect(() => {
    if (isExpoGo) {
      console.log('Push notifications skipped in Expo Go');
      return;
    }

    registerForPushNotificationsAsync().then(async (token) => {
      if (!token) return;
      try {
        await apiClient.put('/auth/push-token', { pushToken: token });
      } catch (e) {
        // Silently fail — non-critical
      }
    });
  }, []);
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Dynamically import only in development builds
  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    Notifications.default.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (!Device.default.isDevice) return null;

    const { status: existingStatus } = await Notifications.default.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.default.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.default.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.default.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const token = (await Notifications.default.getExpoPushTokenAsync()).data;
    return token;
  } catch (e) {
    console.log('Push notifications not available:', e);
    return null;
  }
}
