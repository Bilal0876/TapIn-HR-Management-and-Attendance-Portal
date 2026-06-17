import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { apiClient } from '@/lib/axios';

const isExpoGo = (Constants as any).appOwnership === 'expo';

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
  try {
    if (!Device.isDevice) return null;

    // Graceful check for Expo Go where the native module is stripped
    if (typeof Notifications.setNotificationHandler !== 'function') {
      console.log('Push notifications methods unavailable in this environment.');
      return null;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      } as any),
    });

    const { status: existingStatus } = (await Notifications.getPermissionsAsync()) as any;
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = (await Notifications.requestPermissionsAsync()) as any;
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const projectId = (Constants as any).expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error('[Push] projectId missing from app config — push token cannot be registered.');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;

  } catch (e) {
    console.log('Push notifications not available:', e);
    return null;
  }
}
