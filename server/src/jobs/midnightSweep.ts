import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { logger } from '../lib/logger';

export function startMidnightSweep() {
  // Run at 00:01 every day
  cron.schedule('1 0 * * *', async () => {
    logger.info('Starting midnight attendance sweep...');
    const now = new Date();
    // Yesterday's date string, to process previous day's attendance
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    const targetDateStr = yesterday.toISOString().split('T')[0];
    const targetDate = new Date(targetDateStr);

    try {
      // 1. Find all PENDING records from yesterday and mark them FLAGGED
      const pendedRecords = await prisma.attendanceRecord.findMany({
        where: {
          date: targetDate,
          status: AttendanceStatus.PENDING,
        },
      });

      if (pendedRecords.length > 0) {
        await prisma.attendanceRecord.updateMany({
          where: {
            date: targetDate,
            status: AttendanceStatus.PENDING,
          },
          data: {
            status: AttendanceStatus.FLAGGED,
          },
        });
        logger.info(`Flagged ${pendedRecords.length} unclosed attendance records for ${targetDateStr}.`);
      }

      // 2. Find all active employees who do NOT have an attendance record for yesterday
      // Only process employees whose joiningDate is <= yesterday
      const employees = await prisma.employee.findMany({
        where: { isActive: true },
        include: { profile: true },
      });

      let absentCount = 0;
      for (const emp of employees) {
        // Skip employees without a profile or joining date, just for safety
        if (!emp.profile || !emp.profile.joiningDate) continue;

        // Skip if employee joined AFTER yesterday
        if (emp.profile.joiningDate > targetDate) continue;

        // Check if a record already exists
        const existingRecord = await prisma.attendanceRecord.findUnique({
          where: {
             employeeId_date: { employeeId: emp.id, date: targetDate }
          }
        });

        if (!existingRecord) {
          // No record exists -> Mark ABSENT
          // For an absent record, checkinTime uses the date but it has no real meaning. 
          // We can use 00:00:00 as a placeholder, checkoutTime is null.
          await prisma.attendanceRecord.create({
            data: {
              employeeId: emp.id,
              date: targetDate,
              checkinTime: targetDate, 
              status: AttendanceStatus.ABSENT,
            },
          });
          absentCount++;
        }
      }

      logger.info(`Marked ${absentCount} employees as ABSENT for ${targetDateStr}.`);
    } catch (e) {
      logger.error('Failed to run midnight sweep:', e);
    }
  });

  logger.info('Midnight Sweep CRON job initialized.');
}
