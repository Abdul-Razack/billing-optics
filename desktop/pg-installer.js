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
async function installPostgresWindows(adminPass, onProgress, onLog) {
  const installerUrl = 'https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64.exe';
  const installerPath = path.join(os.tmpdir(), 'postgresql-installer.exe');
  
  onLog('Downloading PostgreSQL installer...');
  
  if (!fs.existsSync(installerPath)) {
    await downloadFile(installerUrl, installerPath, onProgress);
  } else {
    onLog('Installer already downloaded in temp directory.');
    if (onProgress) onProgress(100);
  }

  onLog('Executing silent installation (requires elevated privileges)...');
  
  return new Promise((resolve, reject) => {
    // Unattended mode with provided password
    const installCmd = `"${installerPath}" --mode unattended --superpassword ${adminPass} --serverport 5432`;
    
    exec(installCmd, (error, stdout, stderr) => {
      if (error) {
        onLog(`Installer failed: ${error.message}`);
        return reject(error);
      }
      onLog('Installation completed successfully.');
      resolve(true);
    });
  });
}

// Function to install PostgreSQL on Linux (Ubuntu/Debian)
async function installPostgresLinux(adminPass, onProgress, onLog) {
  onLog('Executing apt-get installation for PostgreSQL (requires pkexec)...');
  
  // Prompt user for auth and run install commands. It sets 'postgres' user password to adminPass
  const bashScript = `
    apt-get update -y &&
    apt-get install -y postgresql postgresql-contrib &&
    systemctl enable postgresql &&
    systemctl start postgresql &&
    su - postgres -c "psql -c \\"ALTER ROLE postgres WITH PASSWORD '${adminPass}';\\""
  `;

  return new Promise((resolve, reject) => {
    // Write script to temp file
    const scriptPath = path.join(os.tmpdir(), 'install_pg.sh');
    fs.writeFileSync(scriptPath, bashScript);
    
    // pkexec provides a graphical prompt if in GUI, or terminal prompt if not
    const installCmd = `pkexec bash ${scriptPath}`;
    
    if (onProgress) onProgress(100); // UI visual feedback

    exec(installCmd, (error, stdout, stderr) => {
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
async function ensurePostgresInstalled(adminPass, onProgress, onLog) {
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
        installPostgresWindows(adminPass, onProgress, onLog).then(resolve).catch(reject);
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
          installPostgresLinux(adminPass, onProgress, onLog).then(resolve).catch(reject);
        }
      });
    });
  } else {
    throw new Error(`Automatic installation is not supported on this platform (${platform}). Please install manually.`);
  }
}

module.exports = { ensurePostgresInstalled };
