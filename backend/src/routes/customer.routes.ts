import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addPrescriptionSchema
} from '../validators/customer.validator';

const router = Router();

router.get('/', authenticate, CustomerController.getAll);

router.get('/:id', authenticate, CustomerController.getById);

router.post(
  '/',
  authenticate,
  validate(createCustomerSchema),
  CustomerController.create
);

router.put(
  '/:id',
  authenticate,
  validate(updateCustomerSchema),
  CustomerController.update
);

router.post(
  '/:id/prescriptions',
  authenticate,
  validate(addPrescriptionSchema),
  CustomerController.addPrescription
);

export default router;
