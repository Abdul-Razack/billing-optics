import env from './config/env';
import { pool } from './config/db';
import { initializeDatabase } from './db/init';
import cron from 'node-cron';
import { BackupService } from './services/backup.service';

import fs from 'fs';
import { appPaths } from './config/paths';

export interface BootstrapContext {
  dbConnected: boolean;
  userDataPath: string | undefined;
}

export async function bootstrap(): Promise<BootstrapContext> {
  console.log('[INIT] Starting Backend Bootstrap...');

  // 1. Environment & Path Configuration
  const userDataPath = process.env.USER_DATA_PATH;
  if (userDataPath) {
    console.log(`[INIT] USER_DATA_PATH injected: ${userDataPath}`);
  } else {
    console.log('[INIT] Using default local storage paths');
  }

  // Ensure directories exist
  const dirsToCreate = [
    appPaths.uploads,
    appPaths.backups,
    appPaths.logs,
    appPaths.cache,
    appPaths.temp
  ];

  dirsToCreate.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 2. Database Initialization
  try {
    await pool.query('SELECT 1');
    console.log('✓ PostgreSQL Connected');
    
    await initializeDatabase();
    console.log('✓ Database Ready');
  } catch (error: any) {
    logStartupError(error);
    throw error;
  }

  // 3. Initialize Scheduled Jobs
  initializeCronJobs();

  return {
    dbConnected: true,
    userDataPath
  };
}

function initializeCronJobs() {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running automated daily backup...');
    try {
      await BackupService.createBackup();
    } catch (error) {
      console.error('Automated backup failed:', error);
    }
  });
  console.log('✓ Scheduled Jobs Initialized');
}

function logStartupError(error: any) {
  console.error('\n================ DATABASE CONNECTION FAILED ================');
  try {
    const dbUrl = new URL(env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres');
    console.error(`* Database Host: ${dbUrl.hostname}:${dbUrl.port}`);
    console.error(`* Database Name: ${dbUrl.pathname.replace('/', '')}`);
    console.error(`* Username:      ${dbUrl.username}`);
  } catch (parseError) {
    console.error('* Configuration: Invalid DATABASE_URL format.');
  }
  console.error(`* Exact Reason:  ${error.message}`);
  console.error(`* Full Stack:    ${error.stack}`);
  console.error('============================================================\n');
}
