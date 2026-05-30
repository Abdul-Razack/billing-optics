import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get('/', HealthController.getHealth);
router.get('/export', HealthController.exportDiagnostics);

export default router;
