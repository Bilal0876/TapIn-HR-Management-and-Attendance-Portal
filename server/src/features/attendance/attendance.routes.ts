import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePasswordChanged } from '../../middleware/requirePasswordChanged';
import { CheckinSchema, CheckoutSchema } from '../../schemas/attendance.schemas';

const router = Router();

router.use(authenticate, requirePasswordChanged);

router.post('/checkin', validate({ body: CheckinSchema }), AttendanceController.checkin);
router.post('/checkout', validate({ body: CheckoutSchema }), AttendanceController.checkout);
router.get('/today', AttendanceController.getToday);
router.get('/history', AttendanceController.getHistory);
router.get('/stats/personal', AttendanceController.getPersonalStats);
router.get('/stats/company', AttendanceController.getCompanyStats);

router.post('/breaks/start', AttendanceController.startBreak);
router.post('/breaks/end', AttendanceController.endBreak);

export default router;
