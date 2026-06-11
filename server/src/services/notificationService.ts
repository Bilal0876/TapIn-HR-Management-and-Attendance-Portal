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

  async notifyAdminsOfAttendanceAction(employeeName: string, action: string, companyId: string) {
    const admins = await prisma.employee.findMany({
      where: {
        companyId,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
        pushToken: { not: null },
      },
      select: { pushToken: true },
    });

    if (admins.length === 0) return;

    const notifications = admins.map((admin) => ({
      to: admin.pushToken!,
      title: '👥 Staff Activity',
      body: `${employeeName} just ${action.toLowerCase()}.`,
      data: { screen: 'dashboard' },
    }));

    for (const n of notifications) {
      await sendPush(n);
    }
  },

  async sendShiftReminder(employeeId: string, minutesBefore: number) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { pushToken: true, name: true } });
    if (!employee?.pushToken) return;

    await sendPush({
      to: employee.pushToken,
      title: '⌛ Shift Starting Soon',
      body: `Hey ${employee.name?.split(' ')[0] ?? 'there'}, your shift starts in ${minutesBefore} minutes!`,
      data: { screen: 'actions' },
    });
  },

  async sendLateShiftWarning(employeeId: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { pushToken: true, name: true } });
    if (!employee?.pushToken) return;

    await sendPush({
      to: employee.pushToken,
      title: '🚨 Shift Started',
      body: `Hey ${employee.name?.split(' ')[0] ?? 'there'}, your shift has already started. Please check in as soon as possible.`,
      data: { screen: 'actions' },
    });
  },
};
