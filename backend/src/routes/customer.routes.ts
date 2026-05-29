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

import { BulkController } from '../controllers/bulk.controller';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.post('/bulk', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), upload.single('file'), BulkController.uploadCustomers);

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
