import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import {
  createVendorSchema,
  updateVendorSchema,
  getVendorsSchema
} from '../validators/vendor.validator';

export function createVendorRoutes() {
  const router = Router();
  
  router.get('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), validate(getVendorsSchema), VendorController.getAll);
  router.get('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), VendorController.getById);
  
  router.post(
    '/',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    validate(createVendorSchema),
    VendorController.create
  );
  
  router.put(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST),
    validate(updateVendorSchema),
    VendorController.update
  );
  
  router.delete(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    VendorController.delete
  );
  
  return router;
}
