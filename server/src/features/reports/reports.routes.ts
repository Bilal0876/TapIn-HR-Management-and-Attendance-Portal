import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePasswordChanged } from '../../middleware/requirePasswordChanged';
import { requireAdmin } from '../../middleware/requireAdmin';

const router = Router();

router.use(authenticate, requirePasswordChanged);

router.get('/my-monthly-pdf', ReportsController.downloadMyMonthlyPDF);

router.use(requireAdmin);
router.get('/monthly', ReportsController.downloadMonthlyReport);
router.get('/monthly-pdf', ReportsController.downloadMonthlyPDF);

export default router;
