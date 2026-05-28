import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import { validateRequest } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema, updateStatusSchema } from '../validators/user.validator';

const router = Router();

// Profile routes (self)
router.get('/me/preferences', authenticate, UserController.getPreferences);
router.put('/me/preferences', authenticate, UserController.updatePreferences);

// Admin User Management routes
const isAdmin = authorizeRoles(ROLES.ADMIN);

router.get('/', authenticate, isAdmin, UserController.getAll);
router.get('/:id', authenticate, isAdmin, UserController.getById);
router.post('/', authenticate, isAdmin, validateRequest(createUserSchema), UserController.create);
router.put('/:id', authenticate, isAdmin, validateRequest(updateUserSchema), UserController.update);
router.patch('/:id/status', authenticate, isAdmin, validateRequest(updateStatusSchema), UserController.updateStatus);

export default router;
