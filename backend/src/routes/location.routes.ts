import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

export const createLocationRoutes = () => {
  const router = Router();

  router.get('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), LocationController.getAll);
  router.get('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), LocationController.getById);
  
  router.post('/', authenticate, authorizeRoles(ROLES.ADMIN), LocationController.create);
  router.put('/:id', authenticate, authorizeRoles(ROLES.ADMIN), LocationController.update);
  router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN), LocationController.delete);

  return router;
};
