import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.settingsService.getSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedSettings = await this.settingsService.updateSettings(req.body);
      res.json({ success: true, data: updatedSettings });
    } catch (error) {
      next(error);
    }
  };
}
