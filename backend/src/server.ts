import { buildApp } from './app';
import env from './config/env';
import { pool } from './config/db';
import { bootstrap } from './bootstrap';

const port = env.PORT;

async function startServer() {
  try {
    const context = await bootstrap();
    
    const app = buildApp(context);
    
    const server = app.listen(port, '0.0.0.0', () => {
      console.log('✓ Backend Running');
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        pool.end();
      });
    });
  } catch (error) {
    process.exit(1); // Exit so the desktop app's startup wrapper can detect the failure
  }
}

startServer();
