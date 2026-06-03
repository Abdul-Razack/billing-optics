import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

export function createAuditRoutes() {
  const router = Router();
  
  router.use(authenticate);
  router.use(authorizeRoles('ADMIN'));
  
  router.get('/', AuditController.getLogs);
  router.get('/export', AuditController.exportLogs);
  return router;
}
