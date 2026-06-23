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

    // Step 2: Attempt auto-migration (Safe upgrade for existing and fresh installations)
    console.log('[INIT] Running database auto-migration...');
    const migrationsFolder = path.resolve(__dirname, 'migrations');
    try {
      await migrate(db, { migrationsFolder, migrationsSchema: 'public', migrationsTable: '__drizzle_migrations' });
      console.log('[INIT] Migrations applied successfully.');
    } catch (migrationError: any) {
      // Fail-Safe: If migrations fail (e.g., due to permission errors on managed databases, or very old legacy schemas without __drizzle_migrations),
      // we log the error but allow the application to start up if core tables already exist.
      console.warn(`[INIT] WARNING: Auto-migration encountered an error: ${migrationError.message}`);
      const usersExists = await tableExists('users');
      if (usersExists) {
        console.warn('[INIT] Core tables exist. Proceeding with startup assuming database is compatible.');
      } else {
        console.error('[INIT] FATAL: Database is empty and migrations failed.');
        throw migrationError;
      }
    }

    // Step 3: Check permissions on existing tables (best effort warning)
    const canAccessUsers = await hasTableAccess('users');
    if (!canAccessUsers) {
      console.warn('[INIT] WARNING: billing_app lacks access to existing tables.');
      console.warn('[INIT] Please run as postgres superuser:');
      console.warn('[INIT] GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO billing_app;');
      console.warn('[INIT] Continuing startup — some features may not work until permissions are fixed.');
    }

    // Step 4: Seed default data
    let count = 1;
    try {
      const result = await db.select({ count: sql<number>`count(*)` }).from(users);
      count = Number(result[0].count);
    } catch (err) {
      // If we can't query users (e.g. permission error), assume seeded to avoid crashing
      count = 1;
    }

    if (count > 0) {
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
