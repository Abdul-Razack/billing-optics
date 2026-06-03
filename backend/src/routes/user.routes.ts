import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema, updateStatusSchema } from '../validators/user.validator';

export function createUserRoutes() {
  const router = Router();
  
  // Profile routes (self)
  router.get('/me/preferences', authenticate, UserController.getPreferences);
  router.put('/me/preferences', authenticate, UserController.updatePreferences);
  
  // Admin User Management routes
  const isAdmin = authorizeRoles(ROLES.ADMIN);
  
  router.get('/', authenticate, isAdmin, UserController.getAll);
  router.get('/:id', authenticate, isAdmin, UserController.getById);
  router.post('/', authenticate, isAdmin, validate(createUserSchema), UserController.create);
  router.put('/:id', authenticate, isAdmin, validate(updateUserSchema), UserController.update);
  router.patch('/:id/status', authenticate, isAdmin, validate(updateStatusSchema), UserController.updateStatus);
  return router;
}
