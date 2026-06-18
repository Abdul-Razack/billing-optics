import { Router } from 'express';
import { VisitorLogController } from '../controllers/visitorLog.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

export function createVisitorLogRoutes() {
  const router = Router();
  
  router.use(authenticate);
  
  router.post('/', authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), VisitorLogController.create);
  router.get('/', authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), VisitorLogController.getAll);
  router.put('/:id', authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), VisitorLogController.update);
  router.delete('/:id', authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), VisitorLogController.remove);

  return router;
}
