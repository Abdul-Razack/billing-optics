import * as jwt from 'jsonwebtoken';
import { db } from './src/config/db';
import { users, products, categories, customers, inventoryLedger } from './src/db/schema';
import { eq } from 'drizzle-orm';
import env from './src/config/env';

async function generateAdminToken() {
  // Find an active admin user
  const adminUsers = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
  
  if (adminUsers.length === 0) {
    console.error('No admin user found. Cannot generate stress test token.');
    process.exit(1);
  }

  const admin = adminUsers[0];
  const token = jwt.sign(
    { userId: admin.id, role: admin.role },
    env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  // Set up mock category if needed
  let categoryId = 1;
  const existingCategory = await db.select().from(categories).limit(1);
  if (existingCategory.length === 0) {
    const [newCat] = await db.insert(categories).values({ name: 'Stress Test Category' }).returning();
    categoryId = newCat.id;
  } else {
    categoryId = existingCategory[0].id;
  }

  // Set up mock product with high stock
  const [testProduct] = await db.insert(products).values({
    name: 'Stress Test Item',
    categoryId,
    costPrice: 10,
    sellingPrice: 20,
    sku: `STRESS-${Date.now()}`
  }).returning();

  // Add huge initial stock
  await db.insert(inventoryLedger).values({
    productId: testProduct.id,
    movementType: 'ADJUSTMENT',
    quantityChange: 1000000,
    notes: 'Initial stock for load testing'
  });

  // Set up mock customer
  let customerId = 1;
  const existingCustomer = await db.select().from(customers).limit(1);
  if (existingCustomer.length === 0) {
    const [newCust] = await db.insert(customers).values({ fullName: 'Stress Tester', phone: '1234567890' }).returning();
    customerId = newCust.id;
  } else {
    customerId = existingCustomer[0].id;
  }

  console.log(`\nexport ARTILLERY_TOKEN="Bearer ${token}"`);
  console.log(`export ARTILLERY_PRODUCT_ID="${testProduct.id}"`);
  console.log(`export ARTILLERY_CUSTOMER_ID="${customerId}"\n`);
  process.exit(0);
}

generateAdminToken().catch(console.error);
