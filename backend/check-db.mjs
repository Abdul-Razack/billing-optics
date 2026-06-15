import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:admin@localhost:5432/billing_optics_prod'
});

async function check() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.log("Tables:", res.rows.map(r => r.table_name).join(", "));
  
  const mig = await client.query(`SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5`).catch(() => ({ rows: [] }));
  console.log("Migrations:", mig.rows);
  
  await client.end();
}

check().catch(console.error);
