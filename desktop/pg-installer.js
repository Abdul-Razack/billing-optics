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
async function installPostgresWindows(onProgress, onLog) {
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
    // Unattended mode with default password 'postgres'
    // UAC prompt will appear to the user.
    const installCmd = `"${installerPath}" --mode unattended --superpassword postgres --serverport 5432`;
    
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

// Main orchestrator function
async function ensurePostgresInstalled(onProgress, onLog) {
  const platform = os.platform();
  
  if (platform === 'win32') {
    return new Promise((resolve, reject) => {
      onLog('Attempting to start existing PostgreSQL service...');
      // Try to start common service names first to handle "installed but stopped" state
      exec('net start postgresql-x64-16', (error) => {
        if (!error) {
          onLog('Service started successfully.');
          return resolve(true);
        }
        
        onLog('Service not found or already running. Proceeding with installation...');
        // If it fails (e.g. not installed), run the full installer
        installPostgresWindows(onProgress, onLog).then(resolve).catch(reject);
      });
    });
  } else {
    // For Linux/Mac, future implementation. 
    throw new Error(`Automatic installation is currently only supported on Windows. Please install PostgreSQL manually via apt-get or brew.`);
  }
}

module.exports = { ensurePostgresInstalled };
