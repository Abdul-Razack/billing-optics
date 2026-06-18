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
import fs from 'fs';
import path from 'path';

import { appPaths } from '../config/paths';

export function createCustomerRoutes() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, appPaths.uploads);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage });
  
  
  const router = Router();
  
  router.post('/bulk', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), upload.single('file'), BulkController.uploadCustomers);
  
  router.get('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), validate(getCustomersSchema), CustomerController.getAll);
  router.get('/birthdays', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), CustomerController.getBirthdays);
  router.get('/anniversaries', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), CustomerController.getAnniversaries);
  router.get('/reports/referrals', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), CustomerController.getTopReferrers);
  router.get('/reports/loyalty', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), CustomerController.getLoyaltyLeaderboard);
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
  
  router.delete(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    CustomerController.delete
  );
  
  router.post(
    '/:id/prescriptions',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    validate(addPrescriptionSchema),
    CustomerController.addPrescription
  );
  return router;
}
