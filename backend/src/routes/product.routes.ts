import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import { createProductSchema, updateProductSchema } from '../validators/catalog.validator';
import { validate } from '../middleware/validation.middleware';
import { BulkController } from '../controllers/bulk.controller';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/', authenticate, ProductController.getAll); // All authenticated can read products (cashier needs them)
router.post('/bulk', authenticate, authorizeRoles(ROLES.ADMIN), upload.single('file'), BulkController.uploadProducts);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), validate(createProductSchema), ProductController.create);
router.put('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), validate(updateProductSchema), ProductController.update);
router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), ProductController.delete);

export default router;
