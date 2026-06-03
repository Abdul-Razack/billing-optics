import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';

export function createReportRoutes() {
  const router = Router();
  
  router.get(
    '/sales',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    ReportController.getSalesReport
  );
  
  router.get(
    '/revenue',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    ReportController.getRevenueReport
  );
  
  router.get(
    '/payments',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    ReportController.getPaymentSummary
  );
  
  router.get(
    '/inventory',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    ReportController.getInventoryReport
  );
  
  router.get(
    '/low-stock',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    ReportController.getLowStockReport
  );
  
  router.get(
    '/customers',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    ReportController.getCustomerReport
  );
  return router;
}
