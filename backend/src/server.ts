import app from './app';
import env from './config/env';
import { pool } from './config/db';
import { initializeDatabase } from './db/init';
import cron from 'node-cron';
import { BackupService } from './services/backup.service';

const port = env.PORT;

async function startServer() {
  try {
    // 1. Validate Database Connection
    console.log('[INIT] Starting Services');
    console.log('Validating PostgreSQL connection...');
    await pool.query('SELECT 1');
    console.log('[INIT] Connecting Database');
    console.log('PostgreSQL connection established successfully.');

    // 2. Run First-Time Setup
    await initializeDatabase();
    console.log('[INIT] Loading Workspace');

    // 3. Start HTTP Server
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Server running in ${env.NODE_ENV} mode on port ${port} (bound to 0.0.0.0)`);
      console.log('[INIT] Ready');
    });

    // 4. Initialize Scheduled Jobs
    cron.schedule('0 2 * * *', async () => {
      console.log('Running automated daily backup...');
      try {
        await BackupService.createBackup();
      } catch (error) {
        console.error('Automated backup failed:', error);
      }
    });

    // 5. Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        pool.end();
      });
    });
  } catch (error) {
    console.error('Failed to start backend: Database connection error.', error);
    process.exit(1); // Exit with failure code so desktop wrapper catches it
  }
}

startServer();

