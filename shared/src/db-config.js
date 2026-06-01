function getDatabaseConfig(envUrl) {
  const dbUrl = envUrl || process.env.DATABASE_URL;
  if (!dbUrl) {
    const error = new Error("Database configuration not found.\nOnboarding required.");
    error.code = 'CONFIG_MISSING';
    throw error;
  }
  
  try {
    const url = new URL(dbUrl);
    if (!url.protocol.startsWith('postgres')) {
      throw new Error("Invalid protocol");
    }
    
    return {
      host: url.hostname,
      port: parseInt(url.port, 10),
      database: decodeURIComponent(url.pathname.replace(/^\//, '')),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      url: dbUrl
    };
  } catch (err) {
    const error = new Error("Database configuration not found.\nOnboarding required.");
    error.code = 'CONFIG_MISSING';
    throw error;
  }
}

const DEFAULT_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'billing_optics_prod',
  adminUser: 'postgres',
  appUser: 'billing_app'
};

module.exports = { getDatabaseConfig, DEFAULT_CONFIG };
