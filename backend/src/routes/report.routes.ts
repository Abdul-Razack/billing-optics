import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

router.get(
  '/sales',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  ReportController.getSalesReport
);

router.get(
  '/payments',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  ReportController.getPaymentSummary
);

router.get(
  '/low-stock',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  ReportController.getLowStockReport
);

export default router;
