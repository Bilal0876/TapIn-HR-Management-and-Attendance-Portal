import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePasswordChanged } from '../../middleware/requirePasswordChanged';
import { requireAdmin } from '../../middleware/requireAdmin';
import { validate } from '../../middleware/validate';
import { DownloadReportSchema } from './reports.dto';

const router = Router();

router.use(authenticate, requirePasswordChanged);

router.get('/my-monthly-pdf', validate({ query: DownloadReportSchema }), ReportsController.downloadMyMonthlyPDF);

router.use(requireAdmin);
router.get('/monthly', validate({ query: DownloadReportSchema }), ReportsController.downloadMonthlyReport);
router.get('/monthly-pdf', validate({ query: DownloadReportSchema }), ReportsController.downloadMonthlyPDF);

export default router;
