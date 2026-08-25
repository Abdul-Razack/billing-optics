import { db } from './src/config/db';
import { users, productVariants } from './src/db/schema';
import { eq } from 'drizzle-orm';
import * as jwt from 'jsonwebtoken';
import env from './src/config/env';

async function run() {
  const adminUsers = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
  const token = jwt.sign({ userId: adminUsers[0].id, role: adminUsers[0].role }, env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
  const variant = await db.select().from(productVariants).limit(1);
  const pId = variant.length > 0 ? variant[0].id : 1;
  const res = await fetch('http://localhost:5000/api/barcodes/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ productVariantId: pId, quantity: 5, batchNumber: 'TEST' })
  });
  console.log(res.status, await res.text());
  process.exit(0);
}
run();
