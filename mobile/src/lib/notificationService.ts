import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
  if (!Device.isDevice) {
    console.warn('[Push] Notifications require a physical device');
    return undefined;
  }

  // 1. Check existing permissions
  const settings = await Notifications.getPermissionsAsync() as any;
  let finalStatus = settings.status;

  // 2. If not granted, request them
  if (settings.status !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync() as any;
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permission denied');
    return undefined;
  }

  // 3. Get the token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.error('[Push] Project ID not found. Ensure EAS is configured.');
      return undefined;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('[Push] Token received:', token);

    // 4. Android-specific channel setup
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('[Push] Failed to get token:', error);
    return undefined;
  }
};
