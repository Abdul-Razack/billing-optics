const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { discoverPostgres } = require('./pg-discovery');

function executePkexec(scriptContent) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(os.tmpdir(), 'repair_pg.sh');
    fs.writeFileSync(scriptPath, scriptContent);
    
    execFile('pkexec', ['bash', scriptPath], (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Repair script failed: ${stderr || error.message}`));
      }
      resolve(stdout);
    });
  });
}

function executeElevatedWindows(psScript) {
  return new Promise((resolve, reject) => {
    const encodedCmd = Buffer.from(psScript, 'utf16le').toString('base64');
    const { exec } = require('child_process');
    exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedCmd}`, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Repair script failed: ${stderr || error.message}`));
      }
      resolve(stdout);
    });
  });
}

async function repairDatabase(config, diagnosticResult, onLog) {
  onLog(`Starting repair for issue: ${diagnosticResult.issue}`);
  const isWindows = os.platform() === 'win32';
  const pgBinPath = config.pgBinPath || (isWindows ? 'C:\\Program Files\\PostgreSQL\\16\\bin' : '/usr/bin');

  // Case A: PostgreSQL stopped
  if (diagnosticResult.postgresInstalled && !diagnosticResult.postgresRunning) {
    onLog('Attempting to start PostgreSQL service...');
    if (isWindows) {
      await executeElevatedWindows(`
        $process = Start-Process -FilePath "net" -ArgumentList "start postgresql-x64-16" -Verb RunAs -Wait -PassThru
        exit $process.ExitCode
      `);
    } else {
      await executePkexec(`
        systemctl enable postgresql &&
        systemctl start postgresql
      `);
    }
    onLog('Service start command executed.');
    
    const verify = discoverPostgres();
    if (!verify.running) {
      throw new Error('Failed to start PostgreSQL service.');
    }
  }

  // Case B: Port changed
  if (diagnosticResult.detectedPort && config.port !== diagnosticResult.detectedPort) {
    onLog(`Updating configured port from ${config.port} to ${diagnosticResult.detectedPort}...`);
    config.port = diagnosticResult.detectedPort;
  }

  // Case C, D, E: Database missing, User missing, Permissions invalid
  if (!diagnosticResult.databaseExists || !diagnosticResult.userExists || !diagnosticResult.credentialsValid || !diagnosticResult.permissionsValid) {
    onLog('Recreating missing database objects and resetting permissions...');
    
    const escapedPass = config.password.replace(/'/g, "''"); // SQL escape
    
    // We construct a SQL file instead of relying on complex bash escaping
    const sqlCommands = `
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = '${config.username}') THEN
      CREATE ROLE ${config.username} LOGIN PASSWORD '${escapedPass}';
   END IF;
END
$do$;

ALTER ROLE ${config.username} WITH PASSWORD '${escapedPass}';

\\c postgres;
-- Create DB cannot be in a DO block, but if we connect to postgres we can try creating it
SELECT 'CREATE DATABASE ${config.database} OWNER ${config.username}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${config.database}')\\gexec

ALTER DATABASE ${config.database} OWNER TO ${config.username};
GRANT ALL PRIVILEGES ON DATABASE ${config.database} TO ${config.username};
\\c ${config.database};
GRANT ALL ON SCHEMA public TO ${config.username};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${config.username};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${config.username};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${config.username};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${config.username};
`;

    if (isWindows) {
      const sqlPath = path.join(os.tmpdir(), 'repair.sql');
      fs.writeFileSync(sqlPath, sqlCommands);
      // Execute via PowerShell with elevated privileges to run as the local system or rely on local trust
      await executeElevatedWindows(`
        $env:PGPASSWORD = "${config.password}"
        $psqlPath = Join-Path -Path "${pgBinPath}" -ChildPath "psql.exe"
        $process = Start-Process -FilePath $psqlPath -ArgumentList "-U postgres -p ${config.port} -f ${sqlPath}" -Wait -NoNewWindow -PassThru
        exit $process.ExitCode
      `);
    } else {
      const escapedBashPass = config.password.replace(/'/g, "'\\''");
      const bashScript = `
        su - postgres -c "psql -p ${config.port} -tAc \\"SELECT 1 FROM pg_roles WHERE rolname='${config.username}'\\"" | grep -q 1 || su - postgres -c "psql -p ${config.port} -c \\"CREATE USER ${config.username} WITH ENCRYPTED PASSWORD '${escapedBashPass}';\\""
        su - postgres -c "psql -p ${config.port} -c \\"ALTER USER ${config.username} WITH ENCRYPTED PASSWORD '${escapedBashPass}';\\""
        su - postgres -c "psql -p ${config.port} -tAc \\"SELECT 1 FROM pg_database WHERE datname='${config.database}'\\"" | grep -q 1 || su - postgres -c "psql -p ${config.port} -c \\"CREATE DATABASE ${config.database} OWNER ${config.username};\\""
        su - postgres -c "psql -p ${config.port} -c \\"ALTER DATABASE ${config.database} OWNER TO ${config.username};\\""
        su - postgres -c "psql -p ${config.port} -c \\"GRANT ALL PRIVILEGES ON DATABASE ${config.database} TO ${config.username};\\""
        su - postgres -c "psql -p ${config.port} -d ${config.database} -c \\"GRANT ALL ON SCHEMA public TO ${config.username}; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${config.username}; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${config.username}; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${config.username}; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${config.username};\\""
      `;
      await executePkexec(bashScript);
    }
    
    onLog('Database and permissions reset completed.');
  }

  onLog('Repair actions completed.');
  return config;
}

module.exports = { repairDatabase };
