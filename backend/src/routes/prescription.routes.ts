import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  getPrescriptionsSchema
} from '../validators/prescription.validator';

import { ROLES } from '../constants/roles';
import { authorizeRoles } from '../middleware/role.middleware';

export function createPrescriptionRoutes() {
  const router = Router();
  
  router.use(authenticate);
  
  router.get(
    '/',
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    validate(getPrescriptionsSchema),
    PrescriptionController.getPrescriptions
  );
  
  router.get(
    '/:id',
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    PrescriptionController.getPrescriptionById
  );
  
  router.get(
    '/customer/:customerId',
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    PrescriptionController.getPrescriptionsByCustomerId
  );
  
  router.post(
    '/',
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    validate(createPrescriptionSchema),
    PrescriptionController.createPrescription
  );
  
  router.put(
    '/:id',
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    validate(updatePrescriptionSchema),
    PrescriptionController.updatePrescription
  );
  return router;
}
