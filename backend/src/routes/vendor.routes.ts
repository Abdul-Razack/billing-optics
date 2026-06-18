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
import { BulkController } from '../controllers/bulk.controller';
import multer from 'multer';
import path from 'path';
import { appPaths } from '../config/paths';

export function createVendorRoutes() {
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
  
  router.post('/bulk', authenticate, authorizeRoles(ROLES.ADMIN), upload.single('file'), BulkController.uploadVendors);
  
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
