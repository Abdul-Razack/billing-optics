import { Router } from 'express';
import { LabJobController } from '../controllers/labJob.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import {
  createLabJobSchema,
  updateLabJobSchema,
  getLabJobsSchema
} from '../validators/labJob.validator';

export function createLabJobRoutes() {
  const router = Router();
  
  router.get('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), validate(getLabJobsSchema), LabJobController.getAll);
  router.get('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER), LabJobController.getById);
  
  router.post(
    '/',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    validate(createLabJobSchema),
    LabJobController.create
  );
  
  router.put(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST, ROLES.CASHIER),
    validate(updateLabJobSchema),
    LabJobController.update
  );
  
  router.delete(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    LabJobController.delete
  );
  
  return router;
}
