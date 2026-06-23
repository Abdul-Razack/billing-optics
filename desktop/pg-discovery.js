const { execSync } = require('child_process');
const os = require('os');

function discoverPostgres(expectedPort = null) {
  const result = {
    installed: false,
    running: false,
    port: null,
    version: null,
    connectionMethod: null
  };

  const isWindows = os.platform() === 'win32';
  const fs = require('fs');

  // 1. Detection via binaries
  try {
    execSync(isWindows ? 'where psql' : 'which psql', { stdio: 'ignore' });
    result.installed = true;
  } catch (err) {
    if (isWindows) {
      // Fallback: direct path checks for Windows EnterpriseDB installations
      const commonPaths = [
        'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
        'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
        'C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe'
      ];
      for (const p of commonPaths) {
        if (fs.existsSync(p)) {
          result.installed = true;
          break;
        }
      }
    } else {
      try {
        execSync('which pg_isready', { stdio: 'ignore' });
        result.installed = true;
      } catch(err2) {
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

  // 3. Port & Running Discovery via TCP Ping (Bulletproof method)
  const portsToTry = expectedPort ? [expectedPort, 5000, 5432] : [5000, 5432];
  for (const port of portsToTry) {
    try {
      const pingCmd = `node -e "const net=require('net');const s=new net.Socket();s.setTimeout(500);s.on('connect',()=>{s.destroy();process.exit(0);});s.on('error',()=>process.exit(1));s.on('timeout',()=>process.exit(1));s.connect(${port},'127.0.0.1');"`;
      execSync(pingCmd, { stdio: 'ignore' });
      result.installed = true;
      result.running = true;
      result.port = port;
      result.connectionMethod = 'tcp_ping';
      break; // Stop if we successfully pinged a port
    } catch(e) {}
  }

  // Fallback to pg_isready if TCP ping failed
  if (!result.running) {
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
