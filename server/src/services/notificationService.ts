import fetch from 'node-fetch';
import { prisma } from '../lib/prisma';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

interface PushPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

async function sendPush(payload: PushPayload) {
  try {
    await fetch(EXPO_PUSH_API, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[NotificationService] push failed', e);
  }
}

export const NotificationService = {
  async notifyCorrectionReviewed(employeeId: string, status: 'APPROVED' | 'REJECTED', date: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { pushToken: true } });
    if (!employee?.pushToken) return;

    const isApproved = status === 'APPROVED';

    await sendPush({
      to: employee.pushToken,
      title: isApproved ? '✅ Correction Approved' : '❌ Correction Rejected',
      body: isApproved
        ? `Your attendance correction for ${date} was approved.`
        : `Your attendance correction for ${date} was not approved.`,
      data: { screen: 'history' },
    });
  },

  async sendCheckinReminder(employeeId: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { pushToken: true, name: true } });
    if (!employee?.pushToken) return;

    await sendPush({
      to: employee.pushToken,
      title: '⏰ Check-in Reminder',
      body: `Good morning, ${employee.name?.split(' ')[0] ?? 'there'}! Don't forget to check in today.`,
      data: { screen: 'actions' },
    });
  },
};
