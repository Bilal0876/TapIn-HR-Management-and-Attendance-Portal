import { Router } from 'express';
import { LeaveController } from './leaves.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';
import { validate } from '../../middleware/validate';
import { CreateLeaveRequestSchema, ReviewLeaveRequestSchema } from '../../schemas/leave.schemas';

const router = Router();

router.use(authenticate);

// Employee routes
router.post('/', validate({ body: CreateLeaveRequestSchema }), LeaveController.create);
router.get('/me', LeaveController.getMyLeaves);

// Admin routes
router.get('/admin/pending', requireAdmin, LeaveController.getAdminPending);
router.put('/admin/:id/review', requireAdmin, validate({ body: ReviewLeaveRequestSchema }), LeaveController.review);

export default router;
