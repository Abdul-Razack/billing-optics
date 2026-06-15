import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import { createProductSchema, updateProductSchema } from '../validators/catalog.validator';
import { validate } from '../middleware/validation.middleware';
import { BulkController } from '../controllers/bulk.controller';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { appPaths } from '../config/paths';

export function createProductRoutes() {
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
  
  router.get('/', authenticate, ProductController.getAll); // All authenticated can read products (cashier needs them)
  router.get('/:id', authenticate, ProductController.getById);
  router.post('/bulk', authenticate, authorizeRoles(ROLES.ADMIN), upload.single('file'), BulkController.uploadProducts);
  router.post('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), validate(createProductSchema), ProductController.create);
  router.put('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), validate(updateProductSchema), ProductController.update);
  router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), ProductController.delete);
  return router;
}
