const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:admin@localhost:5432/billing_optics_prod' });

async function resetDb() {
  await client.connect();
  await client.query('DROP SCHEMA public CASCADE;');
  await client.query('CREATE SCHEMA public;');
  await client.query('GRANT ALL ON SCHEMA public TO postgres;');
  await client.query('GRANT ALL ON SCHEMA public TO public;');
  await client.end();
  console.log('Database reset complete.');
}

resetDb().catch(console.error);
