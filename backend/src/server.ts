import app from './app';
import env from './config/env';

const port = env.PORT;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
