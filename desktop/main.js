const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const kill = require('tree-kill');
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
let backendProcess;
let frontendProcess;

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
      const val = parts.slice(1).join('=')?.trim();
      if (key && val) envConfig[key] = val;
    });

    if (envConfig['DATABASE_URL_ENCRYPTED']) {
      try {
        const { safeStorage } = require('electron');
        if (safeStorage && safeStorage.isEncryptionAvailable()) {
          const buffer = Buffer.from(envConfig['DATABASE_URL_ENCRYPTED'], 'base64');
          envConfig.DATABASE_URL = safeStorage.decryptString(buffer);
        } else {
          envConfig.DATABASE_URL = Buffer.from(envConfig['DATABASE_URL_ENCRYPTED'], 'base64').toString('utf-8');
        }
      } catch (err) {
        console.error('Failed to decrypt database URL:', err);
      }
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

ipcMain.on('start-setup', async (event, companyData) => {
  try {
    const { Client } = require('pg');
    const crypto = require('crypto');
    const { safeStorage } = require('electron');
    const { ensurePostgresInstalled } = require('./pg-installer');

    const appPassword = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
    
    // Connect to PostgreSQL as superuser
    const superuserClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      // Try common local default password to avoid SCRAM empty-string crash
      password: 'postgres', 
    });

    try {
      await superuserClient.connect();
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        onboardingWindow.webContents.send('setup-progress', 'installing-database');
        
        await ensurePostgresInstalled(
          (percent) => onboardingWindow.webContents.send('setup-progress', `installing-progress:${percent}`),
          (logMsg) => console.log('Installer:', logMsg)
        );
        
        // Retry connection after successful installation
        await new Promise(r => setTimeout(r, 3000));
        await superuserClient.connect();
      } else {
        // If authentication failed on an existing service, bubble up
        throw err;
      }
    }

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

    const secureDbUrl = `postgresql://billing_app:${appPassword}@localhost:5432/billing_optics_prod`;
    const defaultPort = '5000';

    // Store securely
    let encryptedUrl = Buffer.from(secureDbUrl).toString('base64');
    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      encryptedUrl = safeStorage.encryptString(secureDbUrl).toString('base64');
    }

    const envContent = `DATABASE_URL_ENCRYPTED=${encryptedUrl}\nPORT=${defaultPort}\nNODE_ENV=production\n`;
    fs.writeFileSync(envPath, envContent);

    envConfig = { DATABASE_URL: secureDbUrl, PORT: defaultPort, NODE_ENV: 'production' };
    
    await startServers(true); // onboarding mode
  } catch (err) {
    console.error('Auto-provisioning failed:', err.message);
    if (onboardingWindow) onboardingWindow.webContents.send('setup-error', 'Local database service not found or access denied.', err.stack || err.message);
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
  
  const serverEnv = { 
    ...process.env, 
    ...envConfig,
    NEXT_PUBLIC_API_URL: `http://localhost:${envConfig.PORT || 5000}/api`,
    USER_DATA_PATH: app.getPath('userData')
  };

  console.log('Starting backend process...');
  if (isDev) {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    backendProcess = spawn(npmCmd, ['run', 'dev:backend'], { cwd: rootPath, env: serverEnv });
  } else {
    const { fork } = require('child_process');
    const backendScript = path.join(rootPath, 'backend', 'dist', 'server.js');
    backendProcess = fork(backendScript, [], { cwd: path.join(rootPath, 'backend'), env: serverEnv, stdio: 'pipe' });
  }
  
  backendProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    console.log(`[Backend]: ${output.trim()}`);
    if (output.includes('[INIT]') && splashWindow) {
      const match = output.match(/\[INIT\] (.*)/);
      if (match && match[1]) splashWindow.webContents.send('setup-progress', match[1]);
    }
  });
  
  backendProcess.stderr?.on('data', (data) => console.error(`[Backend ERR]: ${data}`));
  
  let isBackendHealthy = false;
  backendProcess.on('exit', (code) => {
    if (!isBackendHealthy && code !== 0) {
      console.error(`Backend process exited prematurely with code ${code}`);
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.loadFile(path.join(__dirname, 'error.html'), { query: { type: 'database' } });
      } else {
        dialog.showErrorBox('Database Connection Error', 'The ERP Backend failed to connect to PostgreSQL.');
        app.quit();
      }
    }
  });

  console.log('Starting frontend process...');
  if (isDev) {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    frontendProcess = spawn(npmCmd, ['run', 'dev:frontend'], { cwd: rootPath, env: serverEnv });
  } else {
    const { fork } = require('child_process');
    const nextBin = path.join(rootPath, 'node_modules', 'next', 'dist', 'bin', 'next');
    frontendProcess = fork(nextBin, ['start', '-p', '3000'], { cwd: path.join(rootPath, 'frontend'), env: serverEnv, stdio: 'pipe' });
  }
  
  frontendProcess.stdout?.on('data', (data) => console.log(`[Frontend]: ${data}`));
  frontendProcess.stderr?.on('data', (data) => console.error(`[Frontend ERR]: ${data}`));

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
  if (loadEnv()) {
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
    // Missing config, show setup window
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
  if (backendProcess && backendProcess.pid) {
    kill(backendProcess.pid);
  }
  if (frontendProcess && frontendProcess.pid) {
    kill(frontendProcess.pid);
  }
});
