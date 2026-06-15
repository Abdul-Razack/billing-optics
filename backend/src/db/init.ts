import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/db';
import { settings, users } from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('[INIT] Checking database status...');

    // Safety check: if the drizzle migration tracking table exists but the schema
    // is out of sync (e.g. after db:push was used, or migration files were squashed),
    // reset the tracking table so migrations can rerun cleanly.
    // All migration SQL uses CREATE TABLE IF NOT EXISTS, so this is safe.
    try {
      const trackingResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'drizzle' 
          AND table_name = '__drizzle_migrations'
        ) as exists
      `);
      const trackingExists = trackingResult.rows[0]?.exists === true;

      if (trackingExists) {
        // Check how many migrations are recorded vs how many we have
        const recordedResult = await pool.query(`SELECT count(*) as count FROM drizzle.__drizzle_migrations`);
        const recordedCount = parseInt(recordedResult.rows[0]?.count || '0', 10);

        // We only have 1 migration now (the squashed 0000). If the DB has a different
        // count, it means it was set up with the old multi-file system. Reset it.
        if (recordedCount !== 1) {
          console.log(`[INIT] Detected stale migration history (${recordedCount} records). Resetting for squashed schema...`);
          await pool.query(`DROP SCHEMA IF EXISTS drizzle CASCADE`);
          console.log('[INIT] Migration history reset successfully.');
        }
      }
    } catch (checkError: any) {
      // If the check fails for any reason, we proceed normally.
      // migrate() will handle setting up the drizzle schema if it doesn't exist.
      console.log('[INIT] Migration check skipped (safe to ignore):', checkError?.message);
    }

    // Run migrations unconditionally (Drizzle manages state)
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
