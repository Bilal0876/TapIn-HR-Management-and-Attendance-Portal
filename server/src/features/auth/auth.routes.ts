import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { LoginSchema, RefreshSchema, ChangePasswordSchema, PushTokenSchema } from '../../schemas/auth.schemas';

const router = Router();

router.post('/login', validate({ body: LoginSchema }), AuthController.login);
router.post('/refresh', validate({ body: RefreshSchema }), AuthController.refresh);
router.post('/logout', authenticate, validate({ body: RefreshSchema }), AuthController.logout);
router.post('/change-password', authenticate, validate({ body: ChangePasswordSchema }), AuthController.changePassword);
router.put('/push-token', authenticate, validate({ body: PushTokenSchema }), AuthController.updatePushToken);

export default router;
