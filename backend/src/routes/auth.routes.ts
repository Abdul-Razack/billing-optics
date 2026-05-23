import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import ROLES from '../constants/roles';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', authenticate, authorizeRoles(ROLES.ADMIN), validate(registerSchema), authController.register);

export default router;
