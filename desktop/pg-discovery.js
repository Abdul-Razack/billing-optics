const { execSync } = require('child_process');
const os = require('os');

function discoverPostgres() {
  const result = {
    installed: false,
    running: false,
    port: null,
    version: null,
    connectionMethod: null
  };

  const isWindows = os.platform() === 'win32';

  // 1. Detection via binaries
  try {
    execSync(isWindows ? 'where psql' : 'which psql', { stdio: 'ignore' });
    result.installed = true;
  } catch (err) {
    try {
      execSync(isWindows ? 'where pg_isready' : 'which pg_isready', { stdio: 'ignore' });
      result.installed = true;
    } catch(err2) {
      if (!isWindows) {
        try {
          execSync('which postgres', { stdio: 'ignore' });
          result.installed = true;
        } catch(e) {}
      }
    }
  }

  // 2. Detection via services
  if (!isWindows) {
    try {
      const statusOut = execSync('systemctl status postgresql').toString();
      result.installed = true;
      if (statusOut.includes('active (exited)') || statusOut.includes('active (running)')) {
        result.running = true;
      }
    } catch(e) {
      if (e.stdout && e.stdout.toString().includes('active')) {
        result.installed = true;
        result.running = true;
      }
    }
  } else {
    try {
      const servicesOut = execSync('sc query state= all').toString();
      const match = servicesOut.match(/SERVICE_NAME:\s*(postgresql-x64-\d+)/i) || servicesOut.match(/SERVICE_NAME:\s*(postgresql-\d+)/i);
      if (match && match[1]) {
        const serviceName = match[1];
        const statusOut = execSync(`sc query ${serviceName}`).toString();
        result.installed = true;
        if (statusOut.includes('RUNNING')) {
          result.running = true;
        }
      }
    } catch(e) {}
  }

  // 3. Port & Running Discovery (Method A)
  try {
    const isreadyOut = execSync('pg_isready').toString();
    result.installed = true;
    if (isreadyOut.includes('accepting connections')) {
      result.running = true;
    }
    const match = isreadyOut.match(/:(\d+)/);
    if (match && match[1]) {
      result.port = parseInt(match[1], 10);
      result.connectionMethod = 'pg_isready';
    }
  } catch(e) {
    if (e.stdout) {
      const match = e.stdout.toString().match(/:(\d+)/);
      if (match && match[1]) {
        result.port = parseInt(match[1], 10);
      }
    }
  }

  // 4. Version Detection
  if (result.installed) {
    try {
      const versionOutput = execSync('psql -V').toString();
      const match = versionOutput.match(/psql \(PostgreSQL\) ([\d\.]+)/);
      if (match && match[1]) {
        result.version = match[1];
      }
    } catch(e) {}
  }

  return result;
}

module.exports = { discoverPostgres };
