const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'desktop', 'main.js');
const content = fs.readFileSync(mainPath, 'utf-8');

const startServersStart = content.indexOf('async function startServers(isOnboarding = false)');
const beforeStartServers = content.slice(0, startServersStart);

// find where auto updater IPC handlers begin
const afterStartServersStart = content.indexOf('// IPC Handlers for Auto Updater');
const afterStartServers = content.slice(afterStartServersStart);

const newStartServersBlock = `
let backendProc = null;

async function startFrontend(rootPath) {
  const isDev = !app.isPackaged;
  if (!isDev) {
    console.log('Starting frontend...');
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
  }

  console.log('Waiting for Frontend...');
  const waitOn = require('wait-on');
  try {
    await waitOn({
      resources: [
        'tcp:localhost:3000'
      ],
      timeout: 60000,
    });
    console.log('Frontend is ready!');
  } catch (err) {
    console.error('Frontend readiness check failed:', err);
    throw err;
  }
}

function broadcastBackendStatus(state, details) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('backend-status', { state, details });
  }
}

function broadcastBackendCrash(crashData) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('backend-crash-report', crashData);
  }
}

async function spawnBackend(rootPath, serverEnv) {
  const isDev = !app.isPackaged;
  const log = require('electron-log');
  const waitOn = require('wait-on');

  if (backendProc && backendProc.pid) {
    try {
      backendProc.kill();
    } catch(e) {}
  }

  broadcastBackendStatus('STARTING', 'Initializing backend process...');
  
  if (isDev) {
    console.log('In DEV mode: Please run frontend and backend manually using npm run dev.');
    try {
      await waitOn({
        resources: [\`http-get://localhost:\${serverEnv.PORT || 5000}/api/health\`],
        timeout: 60000,
      });
      broadcastBackendStatus('RUNNING', 'Backend connected');
    } catch (err) {
      broadcastBackendStatus('FAILED', 'Backend timeout in dev mode');
    }
    return;
  }

  const { fork } = require('child_process');
  const http = require('http');
  const backendScript = path.join(rootPath, 'backend', 'dist', 'server.js');
  
  let backendLogs = [];
  
  try {
    log.info(\`Spawning backend: node \${backendScript}\`);
    backendProc = fork(backendScript, [], {
      env: serverEnv,
      stdio: 'pipe',
      cwd: path.dirname(backendScript)
    });
    
    backendProc.stdout.on('data', (data) => {
      const msg = data.toString();
      log.info(\`[Backend] \${msg.trim()}\`);
      backendLogs.push(\`[STDOUT] \${msg.trim()}\`);
      if (backendLogs.length > 50) backendLogs.shift();
    });
    
    backendProc.stderr.on('data', (data) => {
      const msg = data.toString();
      log.error(\`[Backend ERR] \${msg.trim()}\`);
      backendLogs.push(\`[STDERR] \${msg.trim()}\`);
      if (backendLogs.length > 50) backendLogs.shift();
    });
    
    backendProc.on('exit', (code, signal) => {
      const crashError = \`Backend exited unexpectedly with code \${code} (Signal: \${signal}).\`;
      log.error(crashError);
      broadcastBackendStatus('FAILED', crashError);
      broadcastBackendCrash({
        exitCode: code,
        signal: signal,
        stdout: backendLogs.filter(l => l.startsWith('[STDOUT]')).slice(-10).join('\\n'),
        stderr: backendLogs.filter(l => l.startsWith('[STDERR]')).slice(-10).join('\\n')
      });
    });
    
    console.log('Polling for Backend Health Check...');
    const targetPort = serverEnv.PORT || 5000;
    
    // Non-blocking poll loop
    const startTime = Date.now();
    const pollInterval = setInterval(() => {
      if (backendProc.exitCode !== null) {
        clearInterval(pollInterval);
        return; // Handled by exit event
      }
      
      if (Date.now() - startTime > 60000) {
        clearInterval(pollInterval);
        broadcastBackendStatus('FAILED', 'Timeout waiting for backend health check');
        return;
      }
      
      const req = http.get(\`http://localhost:\${targetPort}/api/health\`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(pollInterval);
          broadcastBackendStatus('RUNNING', 'Backend is healthy');
        }
      });
      req.on('error', () => { /* ignore */ });
      req.end();
    }, 2000);
    
  } catch (err) {
    log.error('Backend startup failure:', err);
    broadcastBackendStatus('FAILED', err.message);
  }
}

ipcMain.on('restart-backend', () => {
  broadcastBackendStatus('RESTARTING', 'Restarting backend process...');
  const isDev = !app.isPackaged;
  const rootPath = isDev ? path.resolve(__dirname, '..') : app.getAppPath();
  const serverEnv = { 
    ...process.env, 
    ...envConfig,
    NEXT_PUBLIC_API_URL: \`http://localhost:\${envConfig.PORT || 5000}/api\`,
    USER_DATA_PATH: app.getPath('userData')
  };
  spawnBackend(rootPath, serverEnv);
});

async function startServers(isOnboarding = false) {
  const isDev = !app.isPackaged;
  const rootPath = isDev ? path.resolve(__dirname, '..') : app.getAppPath();
  
  if (!isDev) {
    log.info(\`[Startup]\\nhost=\${envConfig.DATABASE_URL ? (new URL(envConfig.DATABASE_URL)).hostname : 'localhost'}\\nport=\${envConfig.DATABASE_URL ? (new URL(envConfig.DATABASE_URL)).port : '5432'}\\ndatabase=\${envConfig.DATABASE_URL ? (new URL(envConfig.DATABASE_URL)).pathname.substring(1) : 'billing_optics_prod'}\`);
  }

  const serverEnv = { 
    ...process.env, 
    ...envConfig,
    NEXT_PUBLIC_API_URL: \`http://localhost:\${envConfig.PORT || 5000}/api\`,
    USER_DATA_PATH: app.getPath('userData')
  };

  try {
    // 1. Start Frontend FIRST and await it
    await startFrontend(rootPath);

    // 2. Open Window and Onboarding logic
    if (isOnboarding) {
      if (onboardingWindow) {
        onboardingWindow.webContents.send('setup-progress', 'database-ready');
        setTimeout(() => {
          onboardingWindow.webContents.send('setup-progress', 'workspace-ready');
          setTimeout(() => {
            onboardingWindow.webContents.send('setup-progress', 'all-ready');
          }, 1000);
        }, 2000);
      }
    } else {
      console.log('[WINDOW CREATED]', 'main');
      createWindow();
      
      mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        mainWindow.show();
        
        if (app.isPackaged) {
          autoUpdater.checkForUpdates().catch(err => log.error('Failed to check for updates:', err));
        }
      });
    }

    // 3. Spawn Backend asynchronously in the background
    spawnBackend(rootPath, serverEnv);

  } catch (err) {
    // If FRONTEND fails to start, that is still a fatal UI crash
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    createStartupErrorWindow(err.message || 'Fatal UI Startup Error');
  }
}

`;

const newContent = beforeStartServers + newStartServersBlock + afterStartServers;

fs.writeFileSync(mainPath, newContent, 'utf-8');
console.log('Successfully replaced startServers block in main.js');
