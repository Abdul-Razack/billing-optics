const { Client } = require('pg');

async function testAuth() {
  try {
    const client1 = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: '' });
    await client1.connect();
    console.log('Connected with empty string');
    await client1.end();
  } catch (e) { console.error('Empty string error:', e.message); }

  try {
    const client2 = new Client({ host: 'localhost', port: 5432, user: 'postgres' });
    await client2.connect();
    console.log('Connected with undefined');
    await client2.end();
  } catch (e) { console.error('Undefined error:', e.message); }
}

testAuth();
