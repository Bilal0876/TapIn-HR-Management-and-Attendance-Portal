import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import PDFDocument from 'pdfkit-table';

const formatDuration = (mins: number) => {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export class ReportsService {
  static async generateMonthlyExcel(companyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) throw new Error('Company not found');

    const employees = await prisma.employee.findMany({
      where: { companyId, isActive: true },
      include: {
        profile: true,
        attendanceRecords: {
          where: {
            date: { gte: startDate, lte: endDate },
          },
          include: { dailySummary: true },
          orderBy: { date: 'asc' },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`${format(startDate, 'MMMM yyyy')}`);

    sheet.columns = [
      { header: 'Employee Name', key: 'name', width: 20 },
      { header: 'ID', key: 'code', width: 10 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Check In', key: 'checkin', width: 15 },
      { header: 'Check Out', key: 'checkout', width: 15 },
      { header: 'Work Duration', key: 'workMins', width: 15 },
      { header: 'Break Duration', key: 'breakMins', width: 15 },
      { header: 'Late Arrivals', key: 'lateMins', width: 15 },
      { header: 'Net Delta', key: 'netDelta', width: 12 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };

    employees.forEach((emp) => {
      emp.attendanceRecords.forEach((record) => {
        const summary = record.dailySummary;
        const safeFormat = (date: any, fmt: string) => {
          if (!date) return '-';
          const d = new Date(date);
          if (isNaN(d.getTime())) return '-';
          try {
            const zoned = toZonedTime(d, company.timezone || 'UTC');
            return format(zoned, fmt);
          } catch {
            return '-';
          }
        };

        const row = sheet.addRow({
          name: emp.name,
          code: emp.profile?.employeeCode || '-',
          date: safeFormat(record.date, 'yyyy-MM-dd'),
          status: record.status,
          checkin: safeFormat(record.checkinTime, 'hh:mm a'),
          checkout: safeFormat(record.checkoutTime, 'hh:mm a'),
          workMins: formatDuration(summary?.totalWorkMinutes ?? 0),
          breakMins: formatDuration(summary?.totalBreakMinutes ?? 0),
          lateMins: formatDuration(summary?.lateMinutes ?? 0),
          netDelta: summary?.netDeltaMinutes ? (summary.netDeltaMinutes < 0 ? '-' : '+') + formatDuration(Math.abs(summary.netDeltaMinutes)) : '0m',
        });

        if (record.status === 'ABSENT') {
          row.getCell('status').font = { color: { argb: 'FFFF0000' }, bold: true };
        } else if (record.status === 'FLAGGED') {
          row.getCell('status').font = { color: { argb: 'FFF59E0B' }, bold: true };
        }
      });
    });

    return workbook;
  }

  static async generateMonthlyPDF(companyId: string, year: number, month: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const data = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        employees: {
          where: { isActive: true },
          include: {
            profile: true,
            attendanceRecords: {
              where: { date: { gte: startDate, lte: endDate } },
              include: { dailySummary: true },
              orderBy: { date: 'asc' },
            },
          },
        },
      },
    });

    if (!data) throw new Error('Company not found');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    doc.fontSize(20).text(data.name, { align: 'center' });
    doc.fontSize(12).text(`Monthly Attendance Report - ${format(startDate, 'MMMM yyyy')}`, { align: 'center' });
    doc.moveDown();

    const tableRows: string[][] = [];
    data.employees.forEach((emp) => {
      emp.attendanceRecords.forEach((record) => {
        const summary = record.dailySummary;
        const safeFormat = (date: any, fmt: string) => {
          if (!date) return '-';
          const d = new Date(date);
          if (isNaN(d.getTime())) return '-';
          try {
            const zoned = toZonedTime(d, data.timezone || 'UTC');
            return format(zoned, fmt);
          } catch (e) {
            return '-';
          }
        };

        tableRows.push([
          emp.name,
          emp.profile?.employeeCode || '-',
          safeFormat(record.date, 'MMM dd'),
          record.status,
          safeFormat(record.checkinTime, 'hh:mm a'),
          safeFormat(record.checkoutTime, 'hh:mm a'),
          formatDuration(summary?.totalWorkMinutes ?? 0),
          summary?.netDeltaMinutes ? (summary.netDeltaMinutes < 0 ? '-' : '+') + formatDuration(Math.abs(summary.netDeltaMinutes)) : '0m',
        ]);
      });
    });

    const table = {
      title: "Attendance Details",
      headers: ["Employee", "ID", "Date", "Status", "In", "Out", "Work", "Net"],
      rows: tableRows,
    };

    await (doc as any).table(table, {
      prepareHeader: () => { doc.font("Helvetica-Bold").fontSize(10); },
      prepareRow: () => { doc.font("Helvetica").fontSize(8); },
    });

    return doc;
  }

  static async generateEmployeeMonthlyPDF(
    companyId: string,
    employeeId: string,
    year: number,
    month: number
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId, isActive: true },
      include: {
        company: true,
        profile: true,
        attendanceRecords: {
          where: { date: { gte: startDate, lte: endDate } },
          include: { dailySummary: true },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!employee) throw new Error('Employee not found');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    doc.fontSize(18).text(employee.company.name, { align: 'center' });
    doc.fontSize(12).text(`Attendance Report - ${employee.name} - ${format(startDate, 'MMMM yyyy')}`, { align: 'center' });
    doc.moveDown();

    const tableRows: string[][] = [];
    employee.attendanceRecords.forEach((record) => {
      const summary = record.dailySummary;
      const safeFormat = (date: any, fmt: string) => {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        try {
          const zoned = toZonedTime(d, employee.company.timezone || 'UTC');
          return format(zoned, fmt);
        } catch {
          return '-';
        }
      };

      tableRows.push([
        safeFormat(record.date, 'MMM dd'),
        record.status,
        safeFormat(record.checkinTime, 'hh:mm a'),
        safeFormat(record.checkoutTime, 'hh:mm a'),
        formatDuration(summary?.totalWorkMinutes ?? 0),
        summary?.netDeltaMinutes ? (summary.netDeltaMinutes < 0 ? '-' : '+') + formatDuration(Math.abs(summary.netDeltaMinutes)) : '0m',
      ]);
    });

    const table = {
      title: 'Attendance Details',
      headers: ['Date', 'Status', 'In', 'Out', 'Work', 'Net'],
      rows: tableRows,
    };

    await (doc as any).table(table, {
      prepareHeader: () => { doc.font('Helvetica-Bold').fontSize(10); },
      prepareRow: () => { doc.font('Helvetica').fontSize(8); },
    });

    return doc;
  }
}
