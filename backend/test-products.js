const jwt = require('jsonwebtoken');

const token = jwt.sign({ userId: 1, role: 'ADMIN' }, 'local_development_super_secret_key_change_me_in_prod', { expiresIn: '1d' });

fetch('http://localhost:5000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err));
