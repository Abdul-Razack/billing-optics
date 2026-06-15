import { Request, Response, NextFunction } from 'express';
import { ShortcutService } from '../services/shortcut.service';

const shortcutService = new ShortcutService();

export class ShortcutController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shortcutService.getAllShortcuts();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { shortcutKey, productId } = req.body;
      const data = await shortcutService.createShortcut(shortcutKey, productId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await shortcutService.deleteShortcut(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
