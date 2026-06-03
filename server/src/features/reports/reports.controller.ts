import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';

export class ReportsController {
  static async downloadMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query as { year: string, month: string };
      const { companyId } = (req as any).employee;

      const workbook = await ReportsService.generateMonthlyExcel(
        companyId,
        parseInt(year),
        parseInt(month)
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-${year}-${month}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (e) {
      next(e);
    }
  }

  static async downloadMonthlyPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query as { year: string, month: string };
      const { companyId } = (req as any).employee;

      const doc = await ReportsService.generateMonthlyPDF(
        companyId,
        parseInt(year),
        parseInt(month)
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-${year}-${month}.pdf`);

      doc.pipe(res);
      doc.end();
    } catch (e) {
      next(e);
    }
  }

  static async downloadMyMonthlyPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query as { year: string, month: string };
      const { companyId, id: employeeId } = (req as any).employee;

      const doc = await ReportsService.generateEmployeeMonthlyPDF(
        companyId,
        employeeId,
        parseInt(year),
        parseInt(month)
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=my-attendance-${year}-${month}.pdf`);

      doc.pipe(res);
      doc.end();
    } catch (e) {
      next(e);
    }
  }
}
