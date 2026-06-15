import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/db';
import { settings, users } from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('[INIT] Checking database status...');

    // Safety check: reset stale migration history so migrations rerun cleanly.
    // We store migration tracking in the PUBLIC schema (not a separate 'drizzle' schema)
    // because the app user (billing_app) only has access to the public schema.
    try {
      // Step 1: Drop the old 'drizzle' schema if it exists (leftover from old system)
      // The app user may not have permission to drop it, so we silently ignore errors.
      await pool.query(`DROP SCHEMA IF EXISTS drizzle CASCADE`).catch(() => {});

      // Step 2: Check if our migration tracking table exists in the public schema
      const trackingResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '__drizzle_migrations'
        ) as exists
      `);
      const trackingExists = trackingResult.rows[0]?.exists === true;

      if (trackingExists) {
        // Check how many migrations are recorded vs how many we have (should be exactly 1)
        const recordedResult = await pool.query(`SELECT count(*) as count FROM public.__drizzle_migrations`);
        const recordedCount = parseInt(recordedResult.rows[0]?.count || '0', 10);

        // We only have 1 squashed migration. If the DB has a different count,
        // reset it so migrations rerun cleanly (all SQL uses IF NOT EXISTS so it's safe).
        if (recordedCount !== 1) {
          console.log(`[INIT] Detected stale migration history (${recordedCount} records). Resetting for squashed schema...`);
          await pool.query(`DROP TABLE IF EXISTS public.__drizzle_migrations`);
          console.log('[INIT] Migration history reset successfully.');
        }
      }
    } catch (checkError: any) {
      console.log('[INIT] Migration check skipped (safe to ignore):', checkError?.message);
    }

    // Run migrations unconditionally.
    // migrationsSchema: 'public' ensures the tracking table is created in the
    // public schema, which billing_app already has full access to.
    console.log('[INIT] Running database migrations...');
    const migrationsFolder = path.resolve(__dirname, 'migrations');
    await migrate(db, { migrationsFolder, migrationsSchema: 'public', migrationsTable: '__drizzle_migrations' });
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
