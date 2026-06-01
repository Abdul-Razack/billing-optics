import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import env from './env';
import * as schema from '../db/schema';
import { getDatabaseConfig } from '../../../shared/src/db-config';

const { Pool } = pg;
const dbConfig = getDatabaseConfig(env.DATABASE_URL);

export const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.username,
  password: dbConfig.password,
});

export const db = drizzle(pool, { schema });
export default db;
