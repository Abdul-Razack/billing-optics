import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

export default router;
