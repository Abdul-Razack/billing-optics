const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { discoverPostgres } = require('./pg-discovery');

async function repairDatabase(config, diagnosticResult, onLog) {
  onLog(`Starting repair for issue: ${diagnosticResult.issue}`);

  // Case A: PostgreSQL stopped
  if (diagnosticResult.postgresInstalled && !diagnosticResult.postgresRunning) {
    onLog('Attempting to start PostgreSQL service...');
    await executePkexec(`
      systemctl enable postgresql &&
      systemctl start postgresql
    `);
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
    
    const escapedPass = config.password.replace(/'/g, "'\\''");
    
    const bashScript = `
      # Create role if not exists
      su - postgres -c "psql -p ${config.port} -tAc \\"SELECT 1 FROM pg_roles WHERE rolname='${config.username}'\\"" | grep -q 1 || su - postgres -c "psql -p ${config.port} -c \\"CREATE USER ${config.username} WITH ENCRYPTED PASSWORD '${escapedPass}';\\""
      
      # Force password reset
      su - postgres -c "psql -p ${config.port} -c \\"ALTER USER ${config.username} WITH ENCRYPTED PASSWORD '${escapedPass}';\\""
      
      # Create database if not exists
      su - postgres -c "psql -p ${config.port} -tAc \\"SELECT 1 FROM pg_database WHERE datname='${config.database}'\\"" | grep -q 1 || su - postgres -c "psql -p ${config.port} -c \\"CREATE DATABASE ${config.database};\\""
      
      # Reapply permissions
      su - postgres -c "psql -p ${config.port} -c \\"GRANT ALL PRIVILEGES ON DATABASE ${config.database} TO ${config.username};\\""
      
      # Grant schema public
      su - postgres -c "psql -p ${config.port} -d ${config.database} -c \\"GRANT ALL ON SCHEMA public TO ${config.username};\\""
    `;
    
    await executePkexec(bashScript);
    onLog('Database and permissions reset completed.');
  }

  onLog('Repair actions completed.');
  return config;
}

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

module.exports = { repairDatabase };
