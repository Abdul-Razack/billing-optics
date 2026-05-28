import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get(
  '/sales.csv',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
  ExportController.exportSales
);

router.get(
  '/inventory.csv',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
  ExportController.exportInventory
);

router.get(
  '/customers.csv',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
  ExportController.exportCustomers
);

router.get(
  '/payments.csv',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
  ExportController.exportPayments
);

export default router;
