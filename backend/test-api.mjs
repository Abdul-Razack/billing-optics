import jwt from 'jsonwebtoken';

const token = jwt.sign({ userId: 1, role: 'ADMIN' }, 'local_development_super_secret_key_change_me_in_prod', { expiresIn: '1h' });

async function check() {
  try {
    const res = await fetch('http://localhost:5000/api/vendors', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(res.status, await res.text());
  } catch (err) {
    console.error(err);
  }
}

check();
