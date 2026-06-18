const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const db = new sqlite3.Database('./backend/database.sqlite');
db.get("SELECT * FROM users LIMIT 1", (err, row) => {
  if (err) throw err;
  const token = jwt.sign(
    { id: row.id, role: row.role },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '1h' }
  );
  
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/customers/1',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
  });

  req.on('error', (e) => console.error(e));
  req.write(JSON.stringify({ isActive: true }));
  req.end();
});
