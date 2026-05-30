import { Router } from 'express';
import { BackupController } from '../controllers/backup.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';
import { ROLES } from '../domain/roles';

const router = Router();

// Only ADMINs can manage backups
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.post('/', BackupController.createBackup);
router.get('/', BackupController.listBackups);
router.get('/download/:filename', BackupController.downloadBackup);
router.post('/:filename/restore', BackupController.restoreBackup);

export default router;
