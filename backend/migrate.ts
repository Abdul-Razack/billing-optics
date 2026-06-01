import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { getDatabaseConfig } from '../shared/src/db-config';

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  const dbConfig = getDatabaseConfig(process.env.DATABASE_URL);
  const client = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.username,
    password: dbConfig.password,
  });
  await client.connect();
  
  try {
    await client.query(`
      DO $$ BEGIN
       CREATE TYPE "public"."delivery_status" AS ENUM('PENDING', 'READY', 'DELIVERED');
      EXCEPTION
       WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Check if column exists first
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='invoices' and column_name='delivery_status';
    `);
    
    if (res.rows.length === 0) {
      await client.query(`ALTER TABLE "invoices" ADD COLUMN "delivery_status" "delivery_status" DEFAULT 'PENDING' NOT NULL;`);
      console.log('Added delivery_status column.');
    } else {
      console.log('delivery_status column already exists.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
