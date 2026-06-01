import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { logger } from '../lib/logger';

const expo = new Expo();

export class PushService {
  static async sendNotification(to: string, title: string, body: string, data?: any) {
    if (!Expo.isExpoPushToken(to)) {
      logger.error(`Push token ${to} is not a valid Expo push token`);
      return;
    }

    const messages: ExpoPushMessage[] = [{
      to,
      sound: 'default',
      title,
      body,
      data,
    }];

    try {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        logger.info('Push notification sent', { ticketChunk });
        // NOTE: In a production app, you'd handle receipt errors here
      }
    } catch (error) {
      logger.error('Error sending push notification', { error });
    }
  }

  static async sendMultipleNotifications(notifications: { to: string, title: string, body: string, data?: any }[]) {
    const messages: ExpoPushMessage[] = notifications
      .filter(n => Expo.isExpoPushToken(n.to))
      .map(n => ({
        to: n.to,
        sound: 'default',
        title: n.title,
        body: n.body,
        data: n.data,
      }));

    if (messages.length === 0) return;

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        logger.error('Error sending batch push notifications', { error });
      }
    }
  }
}
