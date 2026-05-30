import { Request, Response, NextFunction } from 'express';
import { BackupService } from '../services/backup.service';
import { AppError } from '../utils/errors';
import path from 'path';
import fs from 'fs';

export class BackupController {
  static async createBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const filename = await BackupService.createBackup();
      res.status(200).json({
        success: true,
        message: 'Backup created successfully',
        data: { filename },
      });
    } catch (error: any) {
      next(new AppError(500, 'Failed to create backup', error.message));
    }
  }

  static async listBackups(req: Request, res: Response, next: NextFunction) {
    try {
      const backups = BackupService.listBackups();
      res.status(200).json({
        success: true,
        data: backups,
      });
    } catch (error: any) {
      next(new AppError(500, 'Failed to list backups', error.message));
    }
  }

  static async downloadBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      
      // Basic security to prevent path traversal
      if (!filename || filename.includes('..') || !filename.endsWith('.zip')) {
        return next(new AppError(400, 'Invalid filename format'));
      }

      const filePath = path.resolve(process.cwd(), 'backups', filename);

      if (!fs.existsSync(filePath)) {
        return next(new AppError(404, 'Backup file not found'));
      }

      res.download(filePath, filename);
    } catch (error: any) {
      next(new AppError(500, 'Failed to download backup', error.message));
    }
  }

  static async restoreBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      
      if (!filename || filename.includes('..') || !filename.endsWith('.zip')) {
        return next(new AppError(400, 'Invalid filename format'));
      }

      await BackupService.restoreBackup(filename);
      
      res.status(200).json({
        success: true,
        message: 'Backup restored successfully',
      });
    } catch (error: any) {
      next(new AppError(500, 'Restore failed. Rollback executed if possible.', error.message));
    }
  }
}
