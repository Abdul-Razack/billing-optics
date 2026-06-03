import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { checkoutSchema, addPaymentSchema, getInvoicesSchema } from '../validators/billing.validator';

import { ROLES } from '../constants/roles';
import { authorizeRoles } from '../middleware/role.middleware';

export function createBillingRoutes() {
  const router = Router();
  
  router.get(
    '/',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    validate(getInvoicesSchema),
    BillingController.getInvoices
  );
  
  router.post(
    '/:id/checkout',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    validate(checkoutSchema),
    BillingController.checkout
  );
  
  router.post(
    '/:id/payments',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    validate(addPaymentSchema),
    BillingController.addPayment
  );
  
  router.put(
    '/:id/delivery-status',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    BillingController.updateDeliveryStatus
  );
  
  router.get(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    BillingController.getInvoice
  );
  
  router.put(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    BillingController.updateInvoice
  );
  
  router.post(
    '/:id/void',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    BillingController.voidInvoice
  );
  
  router.get(
    '/:id/pdf',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    BillingController.exportInvoicePdf
  );
  return router;
}
