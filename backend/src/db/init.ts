import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/db';
import { settings, users } from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import { sql } from 'drizzle-orm';
export async function initializeDatabase() {
  try {
    console.log('[INIT] Checking database status...');

    // 1. Run migrations unconditionally (Drizzle manages state)
    console.log('[INIT] Running database migrations...');
    const migrationsFolder = path.resolve(__dirname, 'migrations');
    await migrate(db, { migrationsFolder });
    console.log('[INIT] Migrations applied successfully.');

    // Check if it's a fresh installation to seed default data
    let isFresh = false;
    try {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
      if (Number(count) === 0) {
        isFresh = true;
      }
    } catch (error: any) {
      console.error('[INIT] Could not verify users table:', error);
      throw error;
    }

    if (!isFresh) {
      console.log('[INIT] Database is already seeded.');
      return;
    }

    // 2. Seed default admin
    console.log('[INIT] Creating default administrator account...');
    const defaultPassword = 'admin';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    await db.insert(users).values({
      fullName: 'System Administrator',
      email: 'admin@example.com',
      passwordHash: passwordHash,
      role: 'ADMIN',
      isActive: true,
    });
    
    console.log('[INIT] Administrator account created (admin@example.com / admin).');

    // 3. Seed default settings (Activates Trial)
    console.log('[INIT] Initializing application settings...');
    await db.insert(settings).values({
      businessName: 'My Business',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    });

    console.log('[INIT] Database initialization completed successfully!');

  } catch (error) {
    console.error('[INIT] Failed to initialize database:', error);
    throw error;
  }
}
