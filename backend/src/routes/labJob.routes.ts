import { Router } from 'express';
import { LabJobController } from '../controllers/labJob.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { ROLES } from '../constants/roles';
import { createLabJobSchema, updateLabJobSchema, getLabJobsSchema } from '../validators/labJob.validator';
import { BulkController } from '../controllers/bulk.controller';
import multer from 'multer';
import path from 'path';
import { appPaths } from '../config/paths';

export function createLabJobRoutes() {
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
  
  router.post('/bulk', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.OPTOMETRIST), upload.single('file'), BulkController.uploadLabJobs);

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
