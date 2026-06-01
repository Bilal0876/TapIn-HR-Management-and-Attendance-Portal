import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/monthly', ReportsController.downloadMonthlyReport);
router.get('/monthly-pdf', ReportsController.downloadMonthlyPDF);

export default router;
