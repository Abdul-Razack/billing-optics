import jwt from 'jsonwebtoken';

async function main() {
  try {
    const token = jwt.sign({ userId: 1, role: 'ADMIN' }, "local_development_super_secret_key_change_me_in_prod", { expiresIn: '1h' });
    
    const bdayRes = await fetch("http://localhost:5000/api/customers/anniversaries?month=6", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Anniversary Status:", bdayRes.status);
    console.log("Anniversary Body:", await bdayRes.text());
  } catch(e) {
    console.error(e);
  }
}
main();
