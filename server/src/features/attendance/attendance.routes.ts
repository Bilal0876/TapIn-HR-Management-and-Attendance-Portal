import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePasswordChanged } from '../../middleware/requirePasswordChanged';
import { requireAdmin } from '../../middleware/requireAdmin';
import { requireSuperAdmin } from '../../middleware/requireSuperAdmin';
import { CheckinSchema, CheckoutSchema, UpdateShiftSettingsSchema, AdminUpdateRecordSchema } from './attendance.dto';

const router = Router();

router.use(authenticate, requirePasswordChanged);

router.post('/checkin', validate({ body: CheckinSchema }), AttendanceController.checkin);
router.post('/checkout', validate({ body: CheckoutSchema }), AttendanceController.checkout);
router.get('/today', AttendanceController.getToday);
router.get('/history', AttendanceController.getHistory);
router.get('/stats/personal', AttendanceController.getPersonalStats);
router.get('/stats/company', AttendanceController.getCompanyStats);
router.get('/settings/company-shift', requireSuperAdmin, AttendanceController.getCompanyShiftSettings);
router.put('/settings/company-shift', requireSuperAdmin, validate({ body: UpdateShiftSettingsSchema }), AttendanceController.updateCompanyShiftSettings);
router.get('/stats/company-trend', AttendanceController.getCompanyTrend);
router.get('/stats/company-pulse', requireAdmin, AttendanceController.getCompanyPulse);
router.get('/logs/daily', requireAdmin, AttendanceController.getDailyLogs);
router.patch('/records/:id', requireAdmin, validate({ body: AdminUpdateRecordSchema }), AttendanceController.adminUpdateRecord);

router.post('/breaks/start', AttendanceController.startBreak);
router.post('/breaks/end', AttendanceController.endBreak);

export default router;
