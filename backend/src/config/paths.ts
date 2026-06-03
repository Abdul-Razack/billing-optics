import path from 'path';

// For local dev without Electron's injection, fallback safely.
const rootDataDir = process.env.USER_DATA_PATH 
  ? process.env.USER_DATA_PATH 
  : path.resolve(process.cwd(), '.billing-optics-data');

export const appPaths = {
  root: rootDataDir,
  uploads: path.join(rootDataDir, 'uploads'),
  backups: path.join(rootDataDir, 'backups'),
  logs: path.join(rootDataDir, 'logs'),
  cache: path.join(rootDataDir, 'cache'),
  temp: path.join(rootDataDir, 'temp'),
  license: path.join(rootDataDir, 'license.key')
};
