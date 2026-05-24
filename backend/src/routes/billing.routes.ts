import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { checkoutSchema, addPaymentSchema } from '../validators/billing.validator';

const router = Router();

router.post(
  '/:id/checkout',
  authenticate,
  validate(checkoutSchema),
  BillingController.checkout
);

router.post(
  '/:id/payments',
  authenticate,
  validate(addPaymentSchema),
  BillingController.addPayment
);

router.get(
  '/:id',
  authenticate,
  BillingController.getInvoice
);

export default router;
