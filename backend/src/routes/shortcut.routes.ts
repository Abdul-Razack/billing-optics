import { Router } from 'express';
import { ShortcutController } from '../controllers/shortcut.controller';
import { authenticate } from '../middleware/auth.middleware';

export function createShortcutRoutes() {
  const router = Router();
  router.use(authenticate);

  router.get('/', ShortcutController.getAll);
  router.post('/', ShortcutController.create);
  router.delete('/:id', ShortcutController.delete);

  return router;
}
