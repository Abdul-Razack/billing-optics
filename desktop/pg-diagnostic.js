const { Client } = require('pg');
const { discoverPostgres } = require('./pg-discovery');

async function runDiagnostics(config) {
  const result = {
    postgresInstalled: false,
    postgresRunning: false,
    databaseExists: false,
    userExists: false,
    credentialsValid: false,
    permissionsValid: false,
    detectedPort: null,
    issue: 'Unknown issue'
  };

  const discovery = discoverPostgres();
  result.postgresInstalled = discovery.installed;
  result.postgresRunning = discovery.running;
  result.detectedPort = discovery.port;

  if (!result.postgresInstalled) {
    result.issue = 'PostgreSQL is not installed.';
    return result;
  }

  if (config.port && result.detectedPort && Number(config.port) !== Number(result.detectedPort)) {
    result.issue = `PostgreSQL port changed (configured: ${config.port}, detected: ${result.detectedPort}).`;
    return result;
  }

  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database
  });

  console.log('[PG CONNECT ATTEMPT]', {
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username
  });

  try {
    await client.connect();
    result.postgresRunning = true;
    result.databaseExists = true;
    result.userExists = true;
    result.credentialsValid = true;

    try {
      await client.query('SELECT 1');
      result.permissionsValid = true;
      result.issue = 'No issue detected. Database is healthy.';
    } catch (err) {
      result.issue = `Permission denied: ${err.message}`;
    }
    
    await client.end();
  } catch (err) {
    console.log('[PG CONNECT ERROR]', {
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    const code = err.code || '';
    const msg = err.message || '';

    if (code === 'ECONNREFUSED') {
      result.postgresRunning = false;
      result.issue = 'Connection refused. PostgreSQL service is likely stopped.';
    } else {
      result.postgresRunning = true; // Service is running, just rejecting auth or db
      if (code === '3D000' || (msg.includes('database') && msg.includes('does not exist'))) {
        result.userExists = true;
        result.credentialsValid = true;
        result.databaseExists = false;
        result.issue = 'Database is missing or was deleted.';
      } else if (code === '28P01' || msg.includes('password authentication failed')) {
        if (msg.includes(`role "${config.username}" does not exist`)) {
           result.userExists = false;
           result.issue = 'Application user is missing or was deleted.';
        } else {
           result.userExists = true;
           result.credentialsValid = false;
           result.issue = 'Database credentials are invalid or were changed.';
        }
      } else if (code === '28000' && msg.includes('role') && msg.includes('does not exist')) {
        result.userExists = false;
        result.issue = 'Application user is missing or was deleted.';
      } else {
        result.issue = `Connection error: ${msg}`;
      }
    }
  }

  return result;
}

module.exports = { runDiagnostics };
