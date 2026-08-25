import { db } from './src/config/db';
import { users, products, customers } from './src/db/schema';
import { eq } from 'drizzle-orm';
import * as jwt from 'jsonwebtoken';
import env from './src/config/env';

async function run() {
  const adminUsers = await db.select().from(users).limit(1);
  const token = jwt.sign({ userId: adminUsers[0].id, role: adminUsers[0].role }, env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
  const [testProduct] = await db.select().from(products).limit(1);
  const [testCustomer] = await db.select().from(customers).limit(1);
  
  const res = await fetch('http://localhost:5000/api/billing/STRESS-123/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ customerId: testCustomer.id, createdBy: 1, items: [{ productId: testProduct.id, quantity: 1 }], payments: [{method:'CASH', amount: 100}] })
  });
  console.log(res.status, await res.text());
  process.exit(0);
}
run();
