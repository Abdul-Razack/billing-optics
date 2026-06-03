import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
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

export const env = parsed.success ? parsed.data : {
  PORT: 3000,
  DATABASE_URL: '',
  JWT_SECRET: 'fallback_secret_do_not_use_in_prod',
  JWT_EXPIRES_IN: '30d',
  NODE_ENV: 'development' as const,
  CORS_ORIGIN: '*'
};
export default env;
