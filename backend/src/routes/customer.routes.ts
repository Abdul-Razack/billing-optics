import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addPrescriptionSchema,
  getCustomersSchema
} from '../validators/customer.validator';

const router = Router();

router.get('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), validate(getCustomersSchema), CustomerController.getAll);
router.get('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), CustomerController.getById);

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
  validate(createCustomerSchema),
  CustomerController.create
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
  validate(updateCustomerSchema),
  CustomerController.update
);

router.post(
  '/:id/prescriptions',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
  validate(addPrescriptionSchema),
  CustomerController.addPrescription
);

export default router;
