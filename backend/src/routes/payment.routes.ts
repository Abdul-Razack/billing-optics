import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { getPaymentsSchema } from '../validators/payment.validator';

import { ROLES } from '../constants/roles';
import { authorizeRoles } from '../middleware/role.middleware';

export function createPaymentRoutes() {
  const router = Router();
  
  router.get(
    '/',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    validate(getPaymentsSchema),
    PaymentController.getPayments
  );
  return router;
}
