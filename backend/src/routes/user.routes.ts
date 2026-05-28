import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/me/preferences', authenticate, UserController.getPreferences);
router.put('/me/preferences', authenticate, UserController.updatePreferences);

export default router;
