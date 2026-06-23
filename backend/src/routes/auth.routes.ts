import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import ROLES from '../constants/roles';

export function createAuthRoutes() {
  const router = Router();

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 login requests for testing
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  router.post('/login', loginLimiter, validate(loginSchema), authController.login);
  router.post('/register', authenticate, authorizeRoles(ROLES.ADMIN), validate(registerSchema), authController.register);

  return router;
}
