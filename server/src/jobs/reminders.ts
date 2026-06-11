import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { NotificationService } from '../services/notificationService';
import { toZonedTime } from 'date-fns-tz';
import { setHours, setMinutes, differenceInMinutes, format } from 'date-fns';

/**
 * DYNAMIC SHIFT REMINDERS
 * Runs every minute to check if any employee is 10m before or after their shift.
 */
export const shiftReminders = {
  start: () => {
    cron.schedule('* * * * *', async () => {
      const now = new Date();
      
      try {
        const employees = await prisma.employee.findMany({
          where: {
            isActive: true,
            pushToken: { not: null },
          },
          include: {
            company: true,
            shiftProfile: true,
          }
        });

        for (const emp of employees) {
          const tz = emp.company.timezone || 'Asia/Karachi';
          const localNow = toZonedTime(now, tz);
          
          const hour = emp.shiftProfile?.expectedCheckinHour ?? emp.company.expectedCheckinHour;
          const minute = emp.shiftProfile?.expectedCheckinMinute ?? emp.company.expectedCheckinMinute;
          
          let localShiftStart = new Date(localNow);
          localShiftStart.setHours(hour, minute, 0, 0);

          const diff = differenceInMinutes(localShiftStart, localNow);

          if (diff === 10) {
            logger.info(`[Cron] Sending early reminder to ${emp.name}`);
            await NotificationService.sendShiftReminder(emp.id, 10);
          }

          if (diff === -10) {
            const localDateStr = format(localNow, 'yyyy-MM-dd');
            const localDate = new Date(localDateStr);

            const record = await prisma.attendanceRecord.findFirst({
              where: {
                employeeId: emp.id,
                date: localDate,
              }
            });

            if (!record) {
              logger.info(`[Cron] Sending late warning to ${emp.name}`);
              await NotificationService.sendLateShiftWarning(emp.id);
            }
          }
        }
      } catch (error) {
        logger.error('[Cron] Shift reminder job failed', error);
      }
    });
    logger.info('Shift Reminders Job started (Every Minute)');
  }
};

export const checkinReminder = shiftReminders;
export const checkoutReminder = { start: () => {} };
