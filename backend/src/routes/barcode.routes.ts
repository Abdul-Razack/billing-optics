import { Router } from 'express';
import { BarcodeController } from '../controllers/barcode.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

export function createBarcodeRoutes() {
  const router = Router();

  router.use(authenticate);

  router.get('/', authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), BarcodeController.getBarcodes);
  router.post('/generate', authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), BarcodeController.generateBarcodes);

  return router;
}
