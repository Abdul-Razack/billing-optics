const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

process.on('uncaughtException', (err) => {
  fs.writeFileSync(path.join(app.getPath('userData'), 'crash.log'), err.stack || err.message || String(err));
  console.error("FATAL CRASH:", err);
  // process.exit(1); // Removed to prevent background errors from crashing the UI
});
process.on('unhandledRejection', (err) => {
  fs.writeFileSync(path.join(app.getPath('userData'), 'rejection.log'), err ? (err.stack || err.message) : 'Unknown rejection');
  console.error("FATAL REJECTION:", err);
  // process.exit(1); // Removed to prevent background auto-updater network errors from crashing the app
});
const { exec } = require('child_process');
const waitOn = require('wait-on');
const isDevEnv = !app.isPackaged;
const sharedDbConfigPath = isDevEnv ? '../shared/src/db-config.js' : './shared/src/db-config.js';
const { DEFAULT_CONFIG } = require(sharedDbConfigPath);
const { autoUpdater, CancellationToken } = require('electron-updater');
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
let frontendPort = 3000;
let backendPort = 5000;

function getFreePort() {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

const isDev = !app.isPackaged;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
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
    icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(`http://localhost:${frontendPort}`);
  
  // if (isDev) {
  //  mainWindow.webContents.openDevTools();
  // }
}

const { ipcMain } = require('electron');

let onboardingWindow;
let envConfig = {};
const configPath = path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsedConfig = JSON.parse(content);

      // Validate required fields explicitly (no silent defaults)
      const requiredFields = ['host', 'port', 'database', 'username', 'password'];
      for (const field of requiredFields) {
        if (parsedConfig[field] === undefined || parsedConfig[field] === null || parsedConfig[field] === '') {
          log.warn(`loadConfig: Missing required field '${field}'. Redirecting to onboarding.`);
          return false;
        }
      }

      if (!parsedConfig.jwtSecret) {
        log.warn('loadConfig: Missing jwtSecret. Redirecting to onboarding.');
        return false;
      }

      const { safeStorage } = require('electron');
      if (parsedConfig.isPasswordEncrypted) {
        if (safeStorage && safeStorage.isEncryptionAvailable()) {
          const buffer = Buffer.from(parsedConfig.password, 'base64');
          parsedConfig.password = safeStorage.decryptString(buffer);
        } else {
          log.error('loadConfig: OS Encryption is unavailable to decrypt credentials.');
          return 'corrupted';
        }
      }

      const dbUrl = `postgresql://${parsedConfig.username}:${parsedConfig.password}@${parsedConfig.host}:${parsedConfig.port}/${parsedConfig.database}`;

      if (parsedConfig.githubToken) {
        process.env.GH_TOKEN = parsedConfig.githubToken;
      }

      envConfig = {
        DATABASE_URL: dbUrl,
        JWT_SECRET: parsedConfig.jwtSecret,
        PORT: parsedConfig.appPort || 5000,
        NODE_ENV: 'production',
        GH_TOKEN: parsedConfig.githubToken || ''
      };

      return true;
    } catch (err) {
      log.error('Failed to parse config.json (config may be corrupt):', err.message);
      return 'corrupted';
    }
  }
  return false;
}

function createOnboardingWindow() {
  onboardingWindow = new BrowserWindow({
    width: 700,
    height: 550,
    frame: true,
    title: "Billing Optics ERP - Setup",
    icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  onboardingWindow.loadFile(path.join(__dirname, 'onboarding.html'));
}

let recoveryWindow;
function createRecoveryWindow(diagnosticResult, config) {
  recoveryWindow = new BrowserWindow({
    width: 650,
    height: 500,
    frame: true,
    title: "Billing Optics ERP - Recovery Mode",
    icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  recoveryWindow.loadFile(path.join(__dirname, 'recovery.html'));
  
  recoveryWindow.webContents.once('did-finish-load', () => {
    recoveryWindow.webContents.send('recovery-state', diagnosticResult, config);
  });
}

let startupErrorWindow;
function createStartupErrorWindow(errorMsg) {
  startupErrorWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: true,
    title: "Billing Optics ERP - Startup Error",
    icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  startupErrorWindow.loadFile(path.join(__dirname, 'startup-error.html'));
  
  startupErrorWindow.webContents.once('did-finish-load', () => {
    startupErrorWindow.webContents.send('error-details', errorMsg, log.transports?.file?.getFile()?.path || '');
  });
}

ipcMain.on('retry-startup', async () => {
  if (startupErrorWindow && !startupErrorWindow.isDestroyed()) {
    startupErrorWindow.close();
  }
  await initializeWorkflow();
});

ipcMain.on('recovery-restart', () => {
  app.relaunch();
  app.quit();
});

ipcMain.on('run-repair', async (event, config, diagnosticResult) => {
  try {
    const { repairDatabase } = require('./pg-repair');
    let repairLogs = '';
    const updatedConfig = await repairDatabase(config, diagnosticResult, (logMsg) => {
      repairLogs += logMsg + '\n';
      log.info(`[REPAIR] ${logMsg}`);
      event.reply('repair-log', logMsg);
    });

    const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (updatedConfig.port !== rawConfig.port) {
       rawConfig.port = updatedConfig.port;
       fs.writeFileSync(configPath, JSON.stringify(rawConfig, null, 2), 'utf-8');
       loadConfig();
    }

    event.reply('repair-success', repairLogs);
  } catch(err) {
    event.reply('repair-failed', err.message);
  }
});

ipcMain.on('reset-setup', () => {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
  app.relaunch();
  app.quit();
});

ipcMain.handle('check-postgres', async () => {
  const { discoverPostgres } = require('./pg-discovery');
  return discoverPostgres();
});

ipcMain.handle('get-env', () => {
  return envConfig;
});

ipcMain.handle('test-db-connection', async (event, config) => {
  const { Client } = require('pg');
  try {
    const user = config.isAdvanced ? config.appUser : config.adminUser;
    const password = config.isAdvanced ? config.appPass : config.adminPass;
    const database = config.isAdvanced ? config.dbName : undefined;
    
    const client = new Client({
      host: config.host || DEFAULT_CONFIG.host,
      port: config.port || DEFAULT_CONFIG.port,
      user: user,
      password: password,
      database: 'postgres' // Validate credentials against maintenance DB, as the target app DB may not exist yet
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

    const targetDbName = dbConfig?.dbName || DEFAULT_CONFIG.database;
    const targetAppUser = dbConfig?.appUser || DEFAULT_CONFIG.appUser;
    const targetPort = dbConfig?.port || DEFAULT_CONFIG.port;
    const targetHost = dbConfig?.isAutoInstall ? DEFAULT_CONFIG.host : (dbConfig?.host || DEFAULT_CONFIG.host);

    let appPassword = null;
    if (dbConfig && dbConfig.isAdvanced) {
      // Scenario 3: Advanced Mode
      secureDbUrl = `postgresql://${targetAppUser}:${dbConfig.appPass}@${targetHost}:${targetPort}/${targetDbName}`;
    } else {
      appPassword = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
      let superuserClient;

      if (dbConfig && dbConfig.isAutoInstall) {
        // Scenario 1: Auto Install
        onboardingWindow.webContents.send('setup-progress', 'installing-database');
        await ensurePostgresInstalled(
          dbConfig.adminPass,
          targetPort,
          (percent) => onboardingWindow.webContents.send('setup-progress', `installing-progress:${percent}`),
          (logMsg) => console.log('Installer:', logMsg)
        );
        // Retry connection after install
        await new Promise(r => setTimeout(r, 3000));
        superuserClient = new Client({
          host: DEFAULT_CONFIG.host,
          port: targetPort,
          user: dbConfig.adminUser,
          password: dbConfig.adminPass
        });
      } else if (dbConfig && !dbConfig.isAutoInstall) {
        // Scenario 2: Admin provided credentials
        superuserClient = new Client({
          host: targetHost,
          port: targetPort,
          user: dbConfig.adminUser,
          password: dbConfig.adminPass
        });
      }

      await superuserClient.connect();

      console.log('[INSTALLER] Starting database provisioning');

      // Create User
      const roleRes = await superuserClient.query(`SELECT rolname FROM pg_roles WHERE rolname = $1`, [targetAppUser]);
      if (roleRes.rows.length === 0) {
        await superuserClient.query(`CREATE USER ${targetAppUser} WITH ENCRYPTED PASSWORD '${appPassword}'`);
      } else {
        await superuserClient.query(`ALTER USER ${targetAppUser} WITH ENCRYPTED PASSWORD '${appPassword}'`);
      }

      // Create Database
      const dbRes = await superuserClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = $1`, [targetDbName]);
      if (dbRes.rows.length === 0) {
        await superuserClient.query(`CREATE DATABASE ${targetDbName} OWNER ${targetAppUser}`);
      } else {
        await superuserClient.query(`ALTER DATABASE ${targetDbName} OWNER TO ${targetAppUser}`);
      }

      await superuserClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${targetDbName} TO ${targetAppUser}`);
      await superuserClient.end();

      // Grant on schema public by connecting to the new DB
      const user = dbConfig.adminUser;
      const pass = dbConfig.adminPass;

      const dbClient = new Client({
        host: targetHost,
        port: targetPort,
        user: user,
        password: pass,
        database: targetDbName
      });
      await dbClient.connect();
      await dbClient.query(`GRANT ALL ON SCHEMA public TO ${targetAppUser}`);
      // Grant access to ALL existing tables (including __drizzle_migrations if it already exists)
      await dbClient.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${targetAppUser}`);
      // Grant access to ALL existing sequences (needed for bigserial/serial columns)
      await dbClient.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${targetAppUser}`);
      // Grant access to ALL FUTURE tables and sequences created by any user in this schema
      await dbClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${targetAppUser}`);
      await dbClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${targetAppUser}`);
      await dbClient.end();

      console.log('[INSTALLER] Database provisioning completed');

      secureDbUrl = `postgresql://${targetAppUser}:${appPassword}@${targetHost}:${targetPort}/${targetDbName}`;
    }

    // Generate a stable JWT secret for this installation
    const jwtSecret = crypto.randomBytes(48).toString('hex');
    
    let finalPassword = appPassword;
    if (dbConfig && dbConfig.isAdvanced) {
      finalPassword = dbConfig.appPass;
    }

    let encryptedPassword = finalPassword;
    let isPasswordEncrypted = false;

    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      encryptedPassword = safeStorage.encryptString(finalPassword).toString('base64');
      isPasswordEncrypted = true;
    } else {
      throw new Error("System encryption (OS Keychain) is not available. Setup cannot proceed securely.");
    }

    let winPgPath = 'C:\\\\Program Files\\\\PostgreSQL\\\\16\\\\bin';
    if (require('os').platform() === 'win32') {
      try {
        const psqlPath = require('child_process').execSync('where psql', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\r\n')[0].trim();
        if (psqlPath) {
          winPgPath = path.dirname(psqlPath);
        }
      } catch (e) {
        // Fallback to default paths
        for (let v = 22; v >= 12; v--) {
          const p = `C:\\\\Program Files\\\\PostgreSQL\\\\${v}\\\\bin`;
          if (fs.existsSync(p)) {
            winPgPath = p;
            break;
          }
        }
      }
    }

    const configData = {
      host: targetHost,
      port: targetPort,
      database: targetDbName,
      username: targetAppUser,
      password: encryptedPassword,
      isPasswordEncrypted: isPasswordEncrypted,
      jwtSecret: jwtSecret,
      appPort: defaultPort,
      pgBinPath: require('os').platform() === 'win32' ? winPgPath : '/usr/bin'
    };

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');

    // Run Diagnostics immediately after generating config
    const { runDiagnostics } = require('./pg-diagnostic');
    const diag = await runDiagnostics({
      ...configData,
      password: finalPassword
    });
    if (diag.issue !== 'No issue detected. Database is healthy.') {
      throw new Error(`Diagnostics failed after setup: ${diag.issue}`);
    }

    envConfig = { DATABASE_URL: secureDbUrl, JWT_SECRET: jwtSecret, PORT: defaultPort, NODE_ENV: 'production' };
    
    await startServers(true); // onboarding mode
  } catch (err) {
    console.error('Auto-provisioning failed:', err.message);
    if (onboardingWindow) onboardingWindow.webContents.send('setup-error', 'Database provisioning failed.', err.stack || err.message, err.fallbackPath);
  }
});

ipcMain.on('open-external', (event, pathStr) => {
  const { shell } = require('electron');
  shell.showItemInFolder(pathStr);
});

ipcMain.on('launch-app', () => {
  if (onboardingWindow) onboardingWindow.close();
  createWindow();
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (app.isPackaged) {
      log.info('Checking for updates on startup...');
      try {
        autoUpdater.checkForUpdates().catch(err => {
          log.error('Failed to check for updates:', err);
        });
      } catch (syncErr) {
        log.warn('AutoUpdater failed to initialize synchronously. Ignoring.', syncErr);
      }
    }
  });
});

ipcMain.on('quit-app', () => {
  app.quit();
});

async function startServers(isOnboarding = false) {
  const rootPath = isDev ? path.resolve(__dirname, '..') : app.getAppPath();
  
  if (!isDev) {
    backendPort = await getFreePort();
    frontendPort = await getFreePort();
    envConfig.PORT = backendPort;
    log.info(`[Startup]\nhost=${envConfig.DATABASE_URL ? (new URL(envConfig.DATABASE_URL)).hostname : 'localhost'}\nport=${envConfig.DATABASE_URL ? (new URL(envConfig.DATABASE_URL)).port : '5432'}\ndatabase=${envConfig.DATABASE_URL ? (new URL(envConfig.DATABASE_URL)).pathname.substring(1) : 'billing_optics_prod'}`);
  }

  const serverEnv = { 
    ...process.env, 
    ...envConfig,
    NEXT_PUBLIC_API_URL: `http://localhost:${envConfig.PORT || 5000}/api`,
    USER_DATA_PATH: app.getPath('userData')
  };

  console.log('Starting backend...');
  
  if (!isDev) {
    const { fork } = require('child_process');
    const http = require('http');
    const backendScript = path.join(rootPath, 'backend', 'dist', 'server.js');
    
    // Diagnostic Report Tracking
    const startupReport = {
      PostgreSQLConnected: 'UNKNOWN',
      DatabaseExists: 'UNKNOWN',
      MigrationsCompleted: 'UNKNOWN',
      BackendSpawned: 'NO',
      BackendRunning: 'NO',
      Port5000Listening: 'NO',
      HealthEndpointReachable: 'NO'
    };
    
    const dumpReport = () => {
      let reportStr = '\\n--- BACKEND STARTUP REPORT ---\\n';
      for (const [k, v] of Object.entries(startupReport)) {
        reportStr += `${k}: ${v}\\n`;
      }
      reportStr += '------------------------------';
      log.info(reportStr);
    };

    let backendProc;
    let backendCrashError = null;
    let backendLogs = [];
    
    try {
      log.info(`Spawning backend: node ${backendScript}`);
      log.info(`Backend CWD: ${path.dirname(backendScript)}`);
      
      backendProc = fork(backendScript, [], {
        env: serverEnv,
        stdio: 'pipe',
        cwd: path.dirname(backendScript)
      });
      
      startupReport.BackendSpawned = 'YES';
      startupReport.BackendRunning = 'YES';
      
      backendProc.stdout.on('data', (data) => {
        const msg = data.toString();
        log.info(`[Backend] ${msg.trim()}`);
        backendLogs.push(`[STDOUT] ${msg.trim()}`);
        if (msg.includes('Database connected')) startupReport.PostgreSQLConnected = 'YES';
        if (msg.includes('Migrations completed') || msg.includes('migrated')) startupReport.MigrationsCompleted = 'YES';
        if (msg.includes('Server listening on port') || msg.includes('listening on')) startupReport.Port5000Listening = 'YES';
      });
      
      backendProc.stderr.on('data', (data) => {
        const msg = data.toString();
        log.error(`[Backend ERR] ${msg.trim()}`);
        backendLogs.push(`[STDERR] ${msg.trim()}`);
      });
      
      backendProc.on('exit', (code, signal) => {
        startupReport.BackendRunning = 'NO';
        backendCrashError = `Backend exited unexpectedly with code ${code} (Signal: ${signal}).\\nLast logs:\\n${backendLogs.slice(-15).join('\\n')}`;
        log.error(backendCrashError);
        dumpReport();
      });
      
      // Polling Loop instead of wait-on
      console.log('Polling for Backend Health Check...');
      const targetPort = envConfig.PORT || 5000;
      let isHealthy = false;
      const startTime = Date.now();
      
      while (!isHealthy && (Date.now() - startTime < 60000)) {
        if (backendProc.exitCode !== null) {
          throw new Error(backendCrashError || 'Backend process crashed immediately.');
        }
        
        try {
          await new Promise((resolve, reject) => {
            const req = http.get(`http://localhost:${targetPort}/api/health`, (res) => {
              if (res.statusCode === 200) resolve();
              else reject(new Error(`Bad status: ${res.statusCode}`));
            });
            req.on('error', reject);
            req.setTimeout(1000, () => req.abort());
          });
          isHealthy = true;
          startupReport.HealthEndpointReachable = 'YES';
        } catch (err) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      
      if (!isHealthy) {
        throw new Error(`Timeout waiting for backend to become healthy on port ${targetPort}`);
      }
      
      dumpReport();
      isBackendHealthy = true;
      console.log('Backend is ready!');
      
    } catch (err) {
      log.error('Backend startup failure:', err);
      dumpReport();
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      
      let reason = 'Backend failed to start. ';
      if (startupReport.PostgreSQLConnected === 'UNKNOWN' || startupReport.PostgreSQLConnected === 'NO') reason = 'Database connection failed. ';
      else if (startupReport.MigrationsCompleted === 'UNKNOWN' || startupReport.MigrationsCompleted === 'NO') reason = 'Database migration failed. ';
      else if (startupReport.Port5000Listening === 'NO') reason = 'Port binding failed (Port might be in use). ';
      else if (startupReport.HealthEndpointReachable === 'NO') reason = 'Health endpoint unavailable. ';
      
      createStartupErrorWindow(`${reason}\\n\\nDetails: ${err.message}`);
      return;
    }
  } else {
    // Development: Run manually outside electron or use dynamic imports
    console.log('In DEV mode: Please run frontend and backend manually using npm run dev.');
    console.log('Waiting for Backend Health Check...');
    try {
      await waitOn({
        resources: [
          `http-get://localhost:${envConfig.PORT || 5000}/api/health`
        ],
        timeout: 60000,
      });
      isBackendHealthy = true;
      console.log('Backend is ready!');
    } catch (err) {
      console.error('Backend readiness check failed:', err);
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      createStartupErrorWindow(err.message || 'Timeout waiting for backend to start.');
      return;
    }
  }

  if (!isDev) {
    console.log('Starting frontend...');
    // Production: Start Next.js programmatically
    try {
      const next = require(path.join(rootPath, 'frontend', 'node_modules', 'next'));
      const http = require('http');
      
      const nextApp = next({ dev: false, dir: path.join(rootPath, 'frontend') });
      await nextApp.prepare();
      const handle = nextApp.getRequestHandler();
      
      // Get a guaranteed free port to avoid EADDRINUSE crash
      frontendPort = await getFreePort();
      
      const server = http.createServer((req, res) => {
        handle(req, res);
      });
      
      server.on('error', (err) => {
        console.error('[Frontend ERR] Server error:', err);
      });
      
      server.listen(frontendPort, () => {
        console.log(`[Frontend] Started successfully on port ${frontendPort}`);
      });
    } catch (err) {
      console.error('[Frontend ERR] Failed to start frontend:', err);
    }
  }

  console.log('Waiting for Frontend...');
  try {
    await waitOn({
      resources: [
        `tcp:localhost:${frontendPort}`
      ],
      timeout: 60000,
    });
    console.log('Frontend is ready!');
  } catch (err) {
    console.error('Frontend readiness check failed:', err);
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    createStartupErrorWindow(err.message || 'Timeout waiting for frontend to start.');
    return;
  }

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
      // Disable autoDownload. The user must manually click download.
      autoUpdater.autoDownload = false;
      
      // Removed the automatic background update check on startup.
      // Updates will only be checked when the user manually clicks the button.
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

let downloadCancellationToken = null;

ipcMain.handle('download-update', async () => {
  if (app.isPackaged) {
    try {
      downloadCancellationToken = new CancellationToken();
      autoUpdater.downloadUpdate(downloadCancellationToken);
      return { success: true };
    } catch (error) {
      log.error('Manual update download failed', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Cannot download updates in development mode' };
});

ipcMain.handle('cancel-download', () => {
  if (downloadCancellationToken) {
    downloadCancellationToken.cancel();
    downloadCancellationToken = null;
    log.info('Update download cancelled by user.');
    return { success: true };
  }
  return { success: false, error: 'No active download to cancel' };
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

async function initializeWorkflow() {
  const configStatus = loadConfig();

  if (configStatus === 'corrupted') {
    log.warn('Database config appears corrupt. Showing onboarding to reconfigure.');
    createOnboardingWindow();
    setTimeout(() => {
      if (onboardingWindow && !onboardingWindow.isDestroyed()) {
        onboardingWindow.webContents.send('setup-error', 'Your database configuration appears to be corrupted or from a different installation. Please reconfigure.', '');
      }
    }, 2000);
  } else if (configStatus === true) {
    if (!splashWindow || splashWindow.isDestroyed()) {
      createSplashWindow();
    }
    try {
      const { runDiagnostics } = require('./pg-diagnostic');
      const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const { safeStorage } = require('electron');
      
      if (rawConfig.isPasswordEncrypted) {
        if (safeStorage && safeStorage.isEncryptionAvailable()) {
          const buffer = Buffer.from(rawConfig.password, 'base64');
          rawConfig.password = safeStorage.decryptString(buffer);
        } else {
          throw new Error('OS Encryption unavailable.');
        }
      }
      
      const diag = await runDiagnostics(rawConfig);
      if (diag.issue !== 'No issue detected. Database is healthy.') {
        log.warn(`Health check failed: ${diag.issue}`);
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        createRecoveryWindow(diag, rawConfig);
        return;
      }

      await startServers();
    } catch (error) {
      console.error('Failed to start servers:', error);
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      createStartupErrorWindow(error.message);
    }
  } else {
    createOnboardingWindow();
  }
}

app.whenReady().then(async () => {
  // Set app icon explicitly for Linux/Wayland - window icon property alone
  // is not enough on GNOME Wayland; app.setIcon() ensures the taskbar shows correctly.
  if (process.platform === 'linux') {
    try {
      const { nativeImage } = require('electron');
      const iconPath = path.join(__dirname, 'build', 'icons', '256x256', 'billing-optics-erp.png');
      const fallbackIconPath = path.join(__dirname, 'build', 'icon.png');
      const iconFile = fs.existsSync(iconPath) ? iconPath : fallbackIconPath;
      const appIcon = nativeImage.createFromPath(iconFile);
      if (!appIcon.isEmpty()) {
        app.setIcon(appIcon);
      }
    } catch (e) {
      log.warn('Could not set app icon:', e.message);
    }
  }

  await initializeWorkflow();

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
  if (typeof backendProc !== 'undefined' && backendProc) {
    try { backendProc.kill(); } catch(e) {}
  }
  if (typeof frontendProc !== 'undefined' && frontendProc) {
    try { frontendProc.kill(); } catch(e) {}
  }
});
