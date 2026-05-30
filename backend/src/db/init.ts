import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/db';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('[INIT] Checking database status...');

    // Try to query the users table to see if it exists
    let isFresh = false;
    try {
      await db.select({ count: sql<number>`count(*)` }).from(users);
    } catch (error: any) {
      if (error.code === '42P01') { // 42P01 is PostgreSQL error code for undefined_table
        isFresh = true;
      } else {
        throw error;
      }
    }

    if (!isFresh) {
      console.log('[INIT] Database is already initialized.');
      return;
    }

    console.log('[INIT] Fresh installation detected. Starting initialization...');
    
    // 1. Run migrations
    console.log('[INIT] Running database migrations...');
    const migrationsFolder = path.resolve(__dirname, 'migrations');
    await migrate(db, { migrationsFolder });
    console.log('[INIT] Migrations applied successfully.');

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
    console.log('[INIT] Database initialization completed successfully!');

  } catch (error) {
    console.error('[INIT] Failed to initialize database:', error);
    throw error;
  }
}
