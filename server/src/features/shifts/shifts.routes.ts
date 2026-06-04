import { Router } from 'express';
import { ShiftProfileController } from './shifts.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';
import { requireSuperAdmin } from '../../middleware/requireSuperAdmin';

const router = Router();

// Only Admins or Super Admins can manage shift profiles
router.use(authenticate);

router.get('/', ShiftProfileController.getCompanyShifts);
router.post('/', requireAdmin, ShiftProfileController.createShiftProfile);
router.patch('/:id', requireAdmin, ShiftProfileController.updateShiftProfile);
router.delete('/:id', requireAdmin, ShiftProfileController.deleteShiftProfile);

export default router;
