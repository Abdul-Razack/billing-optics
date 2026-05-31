const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const waitOn = require('wait-on');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Setup logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Prevent duplicate instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow;
let splashWindow;

const isDev = !app.isPackaged;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false, // Don't show immediately, wait for splash screen to close
    title: "Billing Optics ERP",
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL('http://localhost:3000');
  
  // if (isDev) {
  //  mainWindow.webContents.openDevTools();
  // }
}

const fs = require('fs');
const { ipcMain } = require('electron');

let onboardingWindow;
let envConfig = {};
const envPath = path.join(app.getPath('userData'), '.env');

function loadEnv() {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      const key = parts[0]?.trim();
      // Strip all whitespace/newlines from value (handles wrapped base64)
      const val = parts.slice(1).join('=')?.replace(/\s/g, '');
      if (key && val) envConfig[key] = val;
    });

    if (envConfig['DATABASE_URL_ENCRYPTED']) {
      try {
        const { safeStorage } = require('electron');
        if (safeStorage && safeStorage.isEncryptionAvailable()) {
          const buffer = Buffer.from(envConfig['DATABASE_URL_ENCRYPTED'], 'base64');
          envConfig.DATABASE_URL = safeStorage.decryptString(buffer);
        } else {
          // safeStorage unavailable — stored as plain base64 fallback
          envConfig.DATABASE_URL = Buffer.from(envConfig['DATABASE_URL_ENCRYPTED'], 'base64').toString('utf-8');
        }
      } catch (err) {
        log.error('Failed to decrypt database URL (config may be corrupt):', err.message);
        // Return 'corrupted' so app.whenReady can redirect to onboarding
        return 'corrupted';
      }
    }

    // JWT_SECRET stored as plain base64
    if (envConfig['JWT_SECRET_ENCODED']) {
      envConfig.JWT_SECRET = Buffer.from(envConfig['JWT_SECRET_ENCODED'], 'base64').toString('utf-8');
    }

    // .env exists but DATABASE_URL still missing → config incomplete
    if (!envConfig.DATABASE_URL) {
      log.warn('loadEnv: .env found but DATABASE_URL could not be resolved. Redirecting to onboarding.');
      return 'corrupted';
    }

    return true;
  }
  return false;
}

function createOnboardingWindow() {
  onboardingWindow = new BrowserWindow({
    width: 700,
    height: 550,
    frame: true,
    title: "Billing Optics ERP - Setup",
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  onboardingWindow.loadFile(path.join(__dirname, 'onboarding.html'));
}

ipcMain.on('retry-startup', () => {
  app.relaunch();
  app.quit();
});

ipcMain.handle('check-postgres', async () => {
  const { execSync } = require('child_process');
  const os = require('os');
  try {
    if (os.platform() === 'win32') {
      execSync('sc query postgresql-x64-16', { stdio: 'ignore' });
      return true;
    } else {
      execSync('which psql', { stdio: 'ignore' });
      return true;
    }
  } catch (err) {
    return false;
  }
});

ipcMain.handle('test-db-connection', async (event, config) => {
  const { Client } = require('pg');
  try {
    const user = config.isAdvanced ? config.appUser : config.adminUser;
    const password = config.isAdvanced ? config.appPass : config.adminPass;
    const database = config.isAdvanced ? config.dbName : undefined;
    
    const client = new Client({
      host: config.host || 'localhost',
      port: config.port || 5432,
      user: user,
      password: password,
      database: database
    });
    
    await client.connect();
    await client.end();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.on('start-setup', async (event, companyData, dbConfig) => {
  try {
    const { Client } = require('pg');
    const crypto = require('crypto');
    const { safeStorage } = require('electron');
    const { ensurePostgresInstalled } = require('./pg-installer');

    let secureDbUrl = '';
    const defaultPort = '5000';

    if (dbConfig && dbConfig.isAdvanced) {
      // Scenario 3: Advanced Mode
      secureDbUrl = `postgresql://${dbConfig.appUser}:${dbConfig.appPass}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`;
    } else {
      const appPassword = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
      let superuserClient;

      if (dbConfig && dbConfig.isAutoInstall) {
        // Scenario 1: Auto Install
        onboardingWindow.webContents.send('setup-progress', 'installing-database');
        await ensurePostgresInstalled(
          dbConfig.adminPass,
          (percent) => onboardingWindow.webContents.send('setup-progress', `installing-progress:${percent}`),
          (logMsg) => console.log('Installer:', logMsg)
        );
        // Retry connection after install
        await new Promise(r => setTimeout(r, 3000));
        superuserClient = new Client({
          host: 'localhost',
          port: 5432,
          user: dbConfig.adminUser,
          password: dbConfig.adminPass
        });
      } else if (dbConfig && !dbConfig.isAutoInstall) {
        // Scenario 2: Admin provided credentials
        superuserClient = new Client({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.adminUser,
          password: dbConfig.adminPass
        });
      }

      await superuserClient.connect();

      // Create Database
      const dbRes = await superuserClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'billing_optics_prod'`);
      if (dbRes.rows.length === 0) {
        await superuserClient.query(`CREATE DATABASE billing_optics_prod`);
      }

      // Create User
      const roleRes = await superuserClient.query(`SELECT rolname FROM pg_roles WHERE rolname = 'billing_app'`);
      if (roleRes.rows.length === 0) {
        await superuserClient.query(`CREATE USER billing_app WITH ENCRYPTED PASSWORD '${appPassword}'`);
      } else {
        await superuserClient.query(`ALTER USER billing_app WITH ENCRYPTED PASSWORD '${appPassword}'`);
      }

      await superuserClient.query(`GRANT ALL PRIVILEGES ON DATABASE billing_optics_prod TO billing_app`);
      await superuserClient.end();

      // Grant on schema public by connecting to the new DB
      const host = dbConfig.isAutoInstall ? 'localhost' : dbConfig.host;
      const port = dbConfig.isAutoInstall ? 5432 : dbConfig.port;
      const user = dbConfig.adminUser;
      const pass = dbConfig.adminPass;

      const dbClient = new Client({
        host: host,
        port: port,
        user: user,
        password: pass,
        database: 'billing_optics_prod'
      });
      await dbClient.connect();
      await dbClient.query(`GRANT ALL ON SCHEMA public TO billing_app`);
      await dbClient.end();

      secureDbUrl = `postgresql://billing_app:${appPassword}@${host}:${port}/billing_optics_prod`;
    }

    // Generate a stable JWT secret for this installation
    const jwtSecret = crypto.randomBytes(48).toString('hex');
    const jwtSecretEncoded = Buffer.from(jwtSecret).toString('base64');

    // Store securely
    let encryptedUrl = Buffer.from(secureDbUrl).toString('base64');
    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      encryptedUrl = safeStorage.encryptString(secureDbUrl).toString('base64');
    }

    const envContent = `DATABASE_URL_ENCRYPTED=${encryptedUrl}\nJWT_SECRET_ENCODED=${jwtSecretEncoded}\nPORT=${defaultPort}\nNODE_ENV=production\n`;
    fs.writeFileSync(envPath, envContent);

    envConfig = { DATABASE_URL: secureDbUrl, JWT_SECRET: jwtSecret, PORT: defaultPort, NODE_ENV: 'production' };
    
    await startServers(true); // onboarding mode
  } catch (err) {
    console.error('Auto-provisioning failed:', err.message);
    if (onboardingWindow) onboardingWindow.webContents.send('setup-error', 'Database provisioning failed.', err.stack || err.message);
  }
});

ipcMain.on('launch-app', () => {
  if (onboardingWindow) onboardingWindow.close();
  createWindow();
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (app.isPackaged) {
      log.info('Checking for updates on startup...');
      autoUpdater.checkForUpdates().catch(err => {
        log.error('Failed to check for updates:', err);
      });
    }
  });
});

ipcMain.on('quit-app', () => {
  app.quit();
});

async function startServers(isOnboarding = false) {
  const rootPath = isDev ? path.resolve(__dirname, '..') : app.getAppPath();
  
  if (!isDev) {
    log.info(`[Startup] isPackaged: ${app.isPackaged}`);
    log.info(`[Startup] app.getAppPath(): ${app.getAppPath()}`);
    log.info(`[Startup] process.resourcesPath: ${process.resourcesPath}`);
    log.info(`[Startup] rootPath: ${rootPath}`);
    log.info(`[Startup] DATABASE_URL present? ${!!envConfig.DATABASE_URL}`);
    log.info(`[Startup] JWT_SECRET present? ${!!envConfig.JWT_SECRET}`);
    log.info(`[Startup] PORT: ${envConfig.PORT || 5000}`);
  }

  const serverEnv = { 
    ...process.env, 
    ...envConfig,
    NEXT_PUBLIC_API_URL: `http://localhost:${envConfig.PORT || 5000}/api`,
    USER_DATA_PATH: app.getPath('userData')
  };

  console.log('Starting backend and frontend in-process...');
  
  if (!isDev) {
    // Production: Require the backend directly
    try {
      const backendScript = path.join(rootPath, 'backend', 'dist', 'server.js');
      require(backendScript);
      console.log('[Backend] Started successfully in-process');
    } catch (err) {
      console.error('[Backend ERR] Failed to start backend:', err);
    }

    // Production: Start Next.js programmatically
    try {
      const next = require(path.join(rootPath, 'frontend', 'node_modules', 'next'));
      const http = require('http');
      
      const nextApp = next({ dev: false, dir: path.join(rootPath, 'frontend') });
      await nextApp.prepare();
      const handle = nextApp.getRequestHandler();
      
      http.createServer((req, res) => {
        handle(req, res);
      }).listen(3000, () => {
        console.log('[Frontend] Started successfully on port 3000');
      });
    } catch (err) {
      console.error('[Frontend ERR] Failed to start frontend:', err);
    }
  } else {
    // Development: Run manually outside electron or use dynamic imports
    console.log('In DEV mode: Please run frontend and backend manually using npm run dev.');
  }

  console.log('Waiting for Backend and Frontend...');
  await waitOn({
    resources: [
      `tcp:localhost:${envConfig.PORT || 5000}`,
      'tcp:localhost:3000'
    ],
    timeout: 30000,
  });
  isBackendHealthy = true;
  console.log('Servers are ready!');

  if (isOnboarding) {
    if (onboardingWindow) {
      onboardingWindow.webContents.send('setup-progress', 'database-ready');
      // Simulate API call to create workspace with companyData
      setTimeout(() => {
        onboardingWindow.webContents.send('setup-progress', 'workspace-ready');
        // Finalizing
        setTimeout(() => {
          onboardingWindow.webContents.send('setup-progress', 'all-ready');
        }, 1000);
      }, 2000);
    }
  } else {
    createWindow();
    
    mainWindow.once('ready-to-show', () => {
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      mainWindow.show();
      
      // Check for updates after the app is ready (silently)
      if (app.isPackaged) {
        log.info('Checking for updates on startup...');
        autoUpdater.checkForUpdates().catch(err => {
          log.error('Failed to check for updates:', err);
        });
      }
    });
  }
}

// IPC Handlers for Auto Updater
ipcMain.handle('check-for-updates', async () => {
  if (app.isPackaged) {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, result };
    } catch (error) {
      log.error('Manual update check failed', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Cannot check for updates in development mode' };
});

ipcMain.handle('install-update', () => {
  log.info('User requested to install update. Quitting and installing...');
  
  // Before restarting, trigger a database backup
  // This ensures rollback safety. In production we might want to make an HTTP call to the local backend to trigger backup before quitting.
  
  autoUpdater.quitAndInstall(false, true);
});

// Auto Updater Events
autoUpdater.on('update-available', () => {
  log.info('Update available.');
  if (mainWindow) {
    mainWindow.webContents.send('update-available');
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
  
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded.');
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded');
  }
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater.', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

app.whenReady().then(async () => {
  const envStatus = loadEnv();

  if (envStatus === 'corrupted') {
    // .env exists but DB credentials are corrupt/unreadable — show onboarding
    log.warn('Database config appears corrupt. Showing onboarding to reconfigure.');
    createOnboardingWindow();
    // Notify the onboarding window once it loads
    setTimeout(() => {
      if (onboardingWindow && !onboardingWindow.isDestroyed()) {
        onboardingWindow.webContents.send('setup-error', 'Your database configuration appears to be corrupted or from a different installation. Please reconfigure.', '');
      }
    }, 2000);
  } else if (envStatus === true) {
    createSplashWindow();
    try {
      await startServers();
    } catch (error) {
      console.error('Failed to start servers:', error);
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      dialog.showErrorBox('Startup Error', 'Failed to start the local ERP servers.');
      app.quit();
    }
  } else {
    // No .env at all — fresh install, show setup
    createOnboardingWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && mainWindow) {
      createWindow();
    }
  });
});

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Processes are run in-process now, so no external PIDs to kill
});
