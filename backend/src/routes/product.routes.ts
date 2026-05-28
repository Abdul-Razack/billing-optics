import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import { createProductSchema, updateProductSchema } from '../validators/catalog.validator';
import { validateRequest } from '../middleware/validate.middleware';
import { BulkController } from '../controllers/bulk.controller';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/', authenticate, ProductController.getAll);
router.post('/bulk', authenticate, authorizeRoles(ROLES.ADMIN), upload.single('file'), BulkController.uploadProducts);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN), validateRequest(createProductSchema), ProductController.create);
router.put('/:id', authenticate, authorizeRoles(ROLES.ADMIN), validateRequest(updateProductSchema), ProductController.update);
router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN), ProductController.delete);

export default router;
