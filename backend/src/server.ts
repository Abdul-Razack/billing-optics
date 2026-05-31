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
    await pool.query('SELECT 1');
    console.log('✓ PostgreSQL Connected');

    // 2. Run First-Time Setup
    await initializeDatabase();
    console.log('✓ Database Ready');

    // 3. Start HTTP Server
    const server = app.listen(port, '0.0.0.0', () => {
      console.log('✓ Backend Running');
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
  } catch (error: any) {
    console.error('\n================ DATABASE CONNECTION FAILED ================');
    
    // Attempt to parse connection string for diagnostics (safely hiding password)
    try {
      const dbUrl = new URL(env.DATABASE_URL);
      console.error(`* Database Host: ${dbUrl.hostname}:${dbUrl.port}`);
      console.error(`* Database Name: ${dbUrl.pathname.replace('/', '')}`);
      console.error(`* Username:      ${dbUrl.username}`);
    } catch (parseError) {
      console.error('* Configuration: Invalid DATABASE_URL format.');
    }
    
    console.error(`* Exact Reason:  ${error.message}`);
    console.error('============================================================\n');
    
    return; // Recoverable: just return instead of killing the entire process
  }
}

startServer();

