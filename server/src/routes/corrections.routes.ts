import { Router } from 'express';
import { CorrectionController } from '../controllers/corrections.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate } from '../middleware/validate';
import { RequestCorrectionSchema, ReviewCorrectionSchema } from '../dtos/corrections.dto';

const router = Router();

// Employee routes
router.post('/request', authenticate, validate({ body: RequestCorrectionSchema }), CorrectionController.requestCorrection);
router.get('/my-requests', authenticate, CorrectionController.getMyRequests);

// Admin routes
router.get('/pending', authenticate, requireAdmin, CorrectionController.getPendingRequests);
router.patch('/:id/review', authenticate, requireAdmin, validate({ body: ReviewCorrectionSchema }), CorrectionController.reviewRequest);

export default router;
