import dotenv from 'dotenv';
import { z } from 'zod';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('30d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  console.warn('Falling back to default environment variables to prevent fatal crash.');
}

const envData = parsed.success ? parsed.data : {
  PORT: 3000,
  DATABASE_URL: '',
  JWT_SECRET: 'fallback_secret_do_not_use_in_prod',
  JWT_EXPIRES_IN: '30d',
  NODE_ENV: 'development' as const,
  CORS_ORIGIN: '*'
};

// If individual DB variables are provided (from root .env), construct the DATABASE_URL to use PgBouncer port
if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_NAME && process.env.PGBOUNCER_PORT) {
  envData.DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.PGBOUNCER_PORT}/${process.env.DB_NAME}`;
}

export const env = envData;
export default env;
