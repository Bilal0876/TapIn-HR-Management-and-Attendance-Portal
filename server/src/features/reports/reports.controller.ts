import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';

export class ReportsController {
  static async downloadMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query;
      const { companyId } = (req as any).employee;

      if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
      }

      const workbook = await ReportsService.generateMonthlyExcel(
        companyId,
        parseInt(year as string),
        parseInt(month as string)
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=attendance-${year}-${month}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (e) {
      next(e);
    }
  }

  static async downloadMonthlyPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query;
      const { companyId } = (req as any).employee;

      if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
      }

      const doc = await ReportsService.generateMonthlyPDF(
        companyId,
        parseInt(year as string),
        parseInt(month as string)
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=attendance-${year}-${month}.pdf`
      );

      doc.pipe(res);
      doc.end();
    } catch (e) {
      next(e);
    }
  }
}
