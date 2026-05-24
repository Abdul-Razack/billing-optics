import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import { createCategorySchema } from '../validators/catalog.validator';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/', authenticate, CategoryController.getAll);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN), validateRequest(createCategorySchema), CategoryController.create);
router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN), CategoryController.delete);

export default router;
