import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/db';
import { settings, users } from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import { sql } from 'drizzle-orm';

// Check table existence using pg_catalog — always readable regardless of user privileges
async function tableExists(tableName: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' AND tablename = $1
    ) as exists`,
    [tableName]
  );
  return result.rows[0]?.exists === true;
}

// Check if current user has SELECT privilege on a table
async function hasTableAccess(tableName: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT has_table_privilege(current_user, $1, 'SELECT') as has_access`,
      [`public.${tableName}`]
    );
    return result.rows[0]?.has_access === true;
  } catch {
    return false;
  }
}

export async function initializeDatabase() {
  try {
    console.log('[INIT] Checking database status...');

    // Step 1: Clean up old drizzle schema (silently ignore errors)
    await pool.query(`DROP SCHEMA IF EXISTS drizzle CASCADE`).catch(() => {});

    // Step 2: Use pg_catalog to check if core app tables already exist.
    // pg_catalog is ALWAYS readable regardless of user privileges — unlike information_schema.
    const usersExists = await tableExists('users');
    const drizzleTrackingExists = await tableExists('__drizzle_migrations');

    if (usersExists) {
      // Database is already set up. Skip running migrations (avoid permission issues).
      console.log('[INIT] Core tables detected. Skipping full migration run.');

      // Clean up stale migration tracking if we can access it
      if (drizzleTrackingExists) {
        const canAccessTracking = await hasTableAccess('__drizzle_migrations');
        if (canAccessTracking) {
          const countResult = await pool.query(`SELECT count(*) as count FROM public.__drizzle_migrations`);
          const count = parseInt(countResult.rows[0]?.count || '0', 10);
          if (count !== 1) {
            console.log(`[INIT] Resetting stale migration history (${count} records)...`);
            await pool.query(`DROP TABLE IF EXISTS public.__drizzle_migrations`).catch(() => {});
          }
        } else {
          // Drop inaccessible tracking table (best effort — may fail silently)
          await pool.query(`DROP TABLE IF EXISTS public.__drizzle_migrations`).catch(() => {});
        }
      }

      // Check seeding status
      const canAccessUsers = await hasTableAccess('users');
      if (!canAccessUsers) {
        // Permissions not set up correctly — log warning but don't crash
        console.warn('[INIT] WARNING: billing_app lacks access to existing tables.');
        console.warn('[INIT] Please run as postgres superuser:');
        console.warn('[INIT] GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO billing_app;');
        console.warn('[INIT] Continuing startup — some features may not work until permissions are fixed.');
        return;
      }

      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
      if (Number(count) > 0) {
        console.log('[INIT] Database is already seeded.');
        return;
      }

      await seedDefaultData();
      return;
    }

    // Step 3: Fresh install — run full migrations
    console.log('[INIT] Running database migrations...');
    const migrationsFolder = path.resolve(__dirname, 'migrations');
    await migrate(db, { migrationsFolder, migrationsSchema: 'public', migrationsTable: '__drizzle_migrations' });
    console.log('[INIT] Migrations applied successfully.');

    // Step 4: Seed default data
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
    if (Number(count) > 0) {
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
