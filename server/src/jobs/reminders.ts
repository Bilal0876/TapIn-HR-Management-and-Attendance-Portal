import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { PushService } from '../services/push.service';
import { format } from 'date-fns';
import { logger } from '../lib/logger';

/**
 * DAILY PUNCH-IN REMINDER
 * Runs at 09:30 AM every day
 */
export const checkinReminder = cron.schedule('30 9 * * *', async () => {
  logger.info('Running Check-in Reminder Job...');
  const today = new Date();
  
  // Find employees who haven't checked in today and have a push token
  const employees = await prisma.employee.findMany({
    where: {
      isActive: true,
      pushToken: { not: null },
      attendanceRecords: {
        none: {
          date: today,
        }
      }
    }
  });

  if (employees.length === 0) return;

  // Filter out employees who are on APPROVED leave today
  const filteredEmployees = [];
  for (const emp of employees) {
    const onLeave = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: emp.id,
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today },
      }
    });
    if (!onLeave) filteredEmployees.push(emp);
  }

  if (filteredEmployees.length === 0) return;

  const notifications = filteredEmployees.map(emp => ({
    to: emp.pushToken!,
    title: 'Good Morning!',
    body: "You haven't checked in yet. Don't forget to mark your attendance!",
  }));

  await PushService.sendMultipleNotifications(notifications);
  logger.info(`Sent ${notifications.length} check-in reminders.`);
});

/**
 * DAILY PUNCH-OUT REMINDER
 * Runs at 18:30 (6:30 PM) every day
 */
export const checkoutReminder = cron.schedule('30 18 * * *', async () => {
  logger.info('Running Check-out Reminder Job...');
  const today = new Date();

  // Find employees who are still PENDING (checked in but not out)
  const pendingRecords = await prisma.attendanceRecord.findMany({
    where: {
      date: today,
      status: 'PENDING',
      employee: {
        pushToken: { not: null }
      }
    },
    include: { employee: true }
  });

  if (pendingRecords.length === 0) return;

  const notifications = pendingRecords.map(rec => ({
    to: rec.employee.pushToken!,
    title: 'Working late?',
    body: "You're still checked in. Remember to check out before leaving!",
  }));

  await PushService.sendMultipleNotifications(notifications);
  logger.info(`Sent ${notifications.length} check-out reminders.`);
});
