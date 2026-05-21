import { Router } from 'express';
import { correctionController } from './correction.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';

const router = Router();

// Employee routes
router.post('/request', authenticate, correctionController.requestCorrection);
router.get('/my-requests', authenticate, correctionController.getMyRequests);

// Admin routes
router.get('/pending', authenticate, requireAdmin, correctionController.getPendingRequests);
router.patch('/:id/review', authenticate, requireAdmin, correctionController.reviewRequest);

export default router;
