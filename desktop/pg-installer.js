const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const os = require('os');

// Helper to download a file with progress tracking
function downloadFile(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }

      const totalBytes = parseInt(response.headers['content-length'], 10);
      let downloadedBytes = 0;

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (onProgress && totalBytes) {
          const percent = Math.round((downloadedBytes / totalBytes) * 100);
          onProgress(percent);
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// Function to install PostgreSQL on Windows
async function installPostgresWindows(adminPass, port, onProgress, onLog) {
  const installerUrl = 'https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64.exe';
  const installerPath = path.join(os.tmpdir(), 'postgresql-installer.exe');
  
  onLog('Downloading PostgreSQL installer...');
  
  if (!fs.existsSync(installerPath)) {
    await downloadFile(installerUrl, installerPath, onProgress);
    onLog('Download complete.');
  } else {
    onLog('Installer found in temp directory.');
  }

  // Validation
  const stats = fs.statSync(installerPath);
  onLog(`Installer path: ${installerPath}, size: ${stats.size} bytes`);
  
  // Verify size > 10MB
  if (stats.size < 10 * 1024 * 1024) {
    onLog('Downloaded file is less than 10MB, likely corrupted. Re-downloading...');
    fs.unlinkSync(installerPath);
    await downloadFile(installerUrl, installerPath, onProgress);
    const newStats = fs.statSync(installerPath);
    onLog(`New installer size: ${newStats.size} bytes`);
    if (newStats.size < 10 * 1024 * 1024) {
      const err = new Error('Installer download failed or corrupted.');
      err.fallbackPath = installerPath;
      throw err;
    }
  } else {
    if (onProgress) onProgress(100);
  }

  // Check if locked
  try {
    const fd = fs.openSync(installerPath, 'r+');
    fs.closeSync(fd);
  } catch (err) {
    onLog(`Installer file is locked or cannot be accessed: ${err.message}`);
    const fallbackErr = new Error('Installer file is locked by another process (possibly antivirus). Please run it manually.');
    fallbackErr.fallbackPath = installerPath;
    throw fallbackErr;
  }

  onLog('Executing silent installation (requires elevated privileges)...');
  
  return new Promise((resolve, reject) => {
    onLog('Executing installer silently via PowerShell...');
    if (onProgress) onProgress(100); // Hand over to silent installer
    
    const { exec } = require('child_process');
    const args = `--mode unattended --superpassword ${adminPass} --serverport ${port.toString()}`;
    const psCommand = `Start-Process -FilePath "${installerPath}" -ArgumentList "${args}" -Verb RunAs -Wait`;

    exec(`powershell.exe -Command "${psCommand}"`, (error, stdout, stderr) => {
      if (error) {
        onLog(`Installer error code: ${error.code}. Message: ${error.message}`);
        
        let customErrorMsg = `Failed to install PostgreSQL. Error: ${error.message}`;
        if (error.message.includes('Canceled by user') || error.message.includes('canceled by the user') || error.message.includes('EACCES')) {
          customErrorMsg = 'Administrator privileges are required to install PostgreSQL. Please accept the UAC prompt to continue, or manually install PostgreSQL.';
        }
        
        const fallbackErr = new Error(customErrorMsg);
        fallbackErr.fallbackPath = installerPath;
        return reject(fallbackErr);
      }
      onLog('Installation completed successfully.');
      resolve(true);
    });
  });
}

// Function to install PostgreSQL on Linux (Ubuntu/Debian)
async function installPostgresLinux(adminPass, port, onProgress, onLog) {
  onLog('Executing apt-get installation for PostgreSQL (requires pkexec)...');
  
  // Prompt user for auth and run install commands. It sets 'postgres' user password to adminPass.
  // Escaping single quotes in password for safe bash injection.
  const escapedPass = adminPass.replace(/'/g, "'\\''");
  const bashScript = `
    apt-get update -y &&
    apt-get install -y postgresql postgresql-contrib &&
    PG_CONF=$(find /etc/postgresql -name postgresql.conf | head -n 1) &&
    if [ -z "$PG_CONF" ]; then
      echo "[INSTALLER] postgresql.conf not found"
      exit 1
    fi &&
    echo "[INSTALLER] Using config: $PG_CONF" &&
    sed -i "s/^#\\?port = .*/port = ${port}/" "$PG_CONF" &&
    systemctl enable postgresql &&
    systemctl restart postgresql &&
    sleep 2 &&
    pg_isready -p ${port} &&
    echo "[INSTALLER] Setting postgres password" &&
    su - postgres -c "psql -p ${port} -c \\"ALTER ROLE postgres WITH PASSWORD '${escapedPass}';\\"" &&
    echo "[INSTALLER] Password configured successfully"
  `;

  return new Promise((resolve, reject) => {
    // Write script to temp file
    const scriptPath = path.join(os.tmpdir(), 'install_pg.sh');
    fs.writeFileSync(scriptPath, bashScript);
    
    // pkexec provides a graphical prompt if in GUI, or terminal prompt if not
    const { execFile } = require('child_process');
    
    if (onProgress) onProgress(100); // UI visual feedback

    execFile('pkexec', ['bash', scriptPath], (error, stdout, stderr) => {
      if (error) {
        onLog(`Linux Installer failed: ${error.message}. Stderr: ${stderr}`);
        return reject(error);
      }
      onLog('Linux Installation completed successfully.');
      resolve(true);
    });
  });
}

// Main orchestrator function
async function ensurePostgresInstalled(adminPass, port, onProgress, onLog) {
  const platform = os.platform();
  
  if (platform === 'win32') {
    return new Promise((resolve, reject) => {
      onLog('Attempting to start existing PostgreSQL service...');
      exec('net start postgresql-x64-16', (error) => {
        if (!error) {
          onLog('Service started successfully.');
          return resolve(true);
        }
        
        onLog('Service not found or already running. Proceeding with installation...');
        installPostgresWindows(adminPass, port, onProgress, onLog).then(resolve).catch(reject);
      });
    });
  } else if (platform === 'linux') {
    return new Promise((resolve, reject) => {
      onLog('Checking if PostgreSQL is already running...');
      exec('systemctl is-active postgresql', (error, stdout) => {
        if (stdout.trim() === 'active') {
          onLog('PostgreSQL service already active.');
          return resolve(true);
        } else {
          onLog('Service not found or not active. Proceeding with pkexec installation...');
          installPostgresLinux(adminPass, port, onProgress, onLog).then(resolve).catch(reject);
        }
      });
    });
  } else {
    throw new Error(`Automatic installation is not supported on this platform (${platform}). Please install manually.`);
  }
}

module.exports = { ensurePostgresInstalled };
