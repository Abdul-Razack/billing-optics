import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

export function createPurchaseRoutes() {
  const router = Router();

  // Protect all purchase routes
  router.use(authenticate);

  router.post('/', authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), PurchaseController.createPurchase);
  router.get('/', authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), PurchaseController.getPurchases);

  return router;
}
