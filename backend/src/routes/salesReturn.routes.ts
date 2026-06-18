import { Router } from 'express';
import { SalesReturnController } from '../controllers/salesReturn.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

export function createSalesReturnRoutes() {
  router.get('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CASHIER), SalesReturnController.getAllReturns);
  router.post('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CASHIER), SalesReturnController.processReturn);

  return router;
}
