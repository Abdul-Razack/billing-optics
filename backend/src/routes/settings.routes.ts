import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

import { ROLES } from '../constants/roles';
import { authorizeRoles } from '../middleware/role.middleware';

export function createSettingsRoutes() {
  const router = Router();
  const settingsController = new SettingsController();

  router.use(authenticate);

  router.get('/', settingsController.getSettings); // Everyone authenticated needs to see store details for UI
  router.put('/', authorizeRoles(ROLES.ADMIN), settingsController.updateSettings);

  return router;
}
