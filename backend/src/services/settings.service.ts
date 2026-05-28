import { SettingsRepository } from '../repositories/settings.repository';
import { settings } from '../db/schema';

export class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  async getSettings() {
    return this.settingsRepository.getSettings();
  }

  async updateSettings(data: Partial<typeof settings.$inferInsert>) {
    return this.settingsRepository.updateSettings(data);
  }
}
