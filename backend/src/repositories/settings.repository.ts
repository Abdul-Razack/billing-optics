import { db } from '../config/db';
import { settings } from '../db/schema';
import { eq } from 'drizzle-orm';

export class SettingsRepository {
  async getSettings() {
    let currentSettings = await db.query.settings.findFirst({
      where: eq(settings.id, 1),
    });

    if (!currentSettings) {
      // Create default settings row if it doesn't exist
      [currentSettings] = await db.insert(settings).values({
        id: 1,
        businessName: 'My Optics Shop',
        customFieldDefinitions: { products: [], customers: [] }
      }).returning();
    }

    return currentSettings;
  }

  async updateSettings(data: Partial<typeof settings.$inferInsert>) {
    const [updatedSettings] = await db
      .update(settings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(settings.id, 1))
      .returning();
      
    if (!updatedSettings) {
      // In case row 1 wasn't there
      return (await db.insert(settings).values({
        id: 1,
        businessName: 'My Optics Shop',
        ...data,
      }).returning())[0];
    }
      
    return updatedSettings;
  }
}
