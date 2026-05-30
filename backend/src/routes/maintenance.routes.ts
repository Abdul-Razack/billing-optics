import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get('/stats', MaintenanceController.getTableStats);
router.post('/optimize', MaintenanceController.optimizeDatabase);
router.post('/verify-backup', MaintenanceController.verifyBackup);
router.get('/export', MaintenanceController.exportReport);

export default router;
