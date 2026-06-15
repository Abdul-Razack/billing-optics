import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/db';
import { settings, users } from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('[INIT] Checking database status...');

    // --- Safety check: pre-migration environment repair ---
    // The app connects as 'billing_app' which may not own tables created by 'postgres'.
    // We use information_schema (which is accessible to all users) to check what exists.
    try {
      // Step 1: Try to drop the old 'drizzle' schema (silently ignore permission errors)
      await pool.query(`DROP SCHEMA IF EXISTS drizzle CASCADE`).catch(() => {});

      // Step 2: Check if __drizzle_migrations table exists in public schema
      const trackingResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '__drizzle_migrations'
        ) as exists
      `);
      const trackingExists = trackingResult.rows[0]?.exists === true;

      if (trackingExists) {
        // Check if current user has access to the table
        const accessResult = await pool.query(`
          SELECT has_table_privilege(current_user, 'public.__drizzle_migrations', 'SELECT') as has_access
        `);
        const hasAccess = accessResult.rows[0]?.has_access === true;

        if (!hasAccess) {
          // Table exists but current user can't access it (was created by postgres or another superuser).
          // Check if the main app tables are already fully set up and accessible.
          const usersExist = await pool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name = 'users'
            ) as exists
          `);
          if (usersExist.rows[0]?.exists === true) {
            console.log('[INIT] Database already initialized. Skipping migrations (permission-safe mode).');
            // Jump directly to seeding check below by returning early from the try block.
            // We skip the full migrate() call since the DB is already set up.
            let isFresh = false;
            const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
            if (Number(count) === 0) isFresh = true;
            if (!isFresh) { console.log('[INIT] Database is already seeded.'); return; }
            await seedDefaultData();
            return;
          }
          // If users table doesn't exist, we have a broken state. 
          // Drop the inaccessible tracking table if possible, then proceed.
          await pool.query(`DROP TABLE IF EXISTS public.__drizzle_migrations`).catch(() => {});
          console.log('[INIT] Cleared inaccessible migration tracking table.');
        } else {
          // We have access — check if count matches our single squashed migration
          const recordedResult = await pool.query(`SELECT count(*) as count FROM public.__drizzle_migrations`);
          const recordedCount = parseInt(recordedResult.rows[0]?.count || '0', 10);

          if (recordedCount !== 1) {
            console.log(`[INIT] Detected stale migration history (${recordedCount} records). Resetting...`);
            await pool.query(`DROP TABLE IF EXISTS public.__drizzle_migrations`);
            console.log('[INIT] Migration history reset successfully.');
          }
        }
      }
    } catch (checkError: any) {
      console.log('[INIT] Pre-migration check skipped (safe to ignore):', checkError?.message);
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

    await seedDefaultData();

  } catch (error) {
    console.error('[INIT] Failed to initialize database:', error);
    throw error;
  }
}

async function seedDefaultData() {
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

  console.log('[INIT] Initializing application settings...');
  await db.insert(settings).values({
    businessName: 'My Business',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });

  console.log('[INIT] Database initialization completed successfully!');
}
