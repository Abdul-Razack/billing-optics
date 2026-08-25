import * as jwt from 'jsonwebtoken';
import { db } from './src/config/db';
import { users, productVariants, products, categories, customers, inventoryLedger } from './src/db/schema';
import { eq } from 'drizzle-orm';
import env from './src/config/env';
import { execSync } from 'child_process';

async function runFullSystemStressTest() {
  console.log("Setting up Full System Stress Test...");
  try {
    const adminUsers = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
    if (adminUsers.length === 0) {
      console.error('No admin user found. Cannot proceed.');
      process.exit(1);
    }

    const admin = adminUsers[0];
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );
    console.log(`[OK] Generated Admin Token`);

    // 1. Setup Category
    let categoryId = 1;
    const existingCategory = await db.select().from(categories).limit(1);
    if (existingCategory.length === 0) {
      const [newCat] = await db.insert(categories).values({ name: 'Full System Stress Category' }).returning();
      categoryId = newCat.id;
    } else {
      categoryId = existingCategory[0].id;
    }

    // 2. Setup Product
    const [testProduct] = await db.insert(products).values({
      name: 'Full Stress Test Item',
      categoryId,
      costPrice: 50,
      sellingPrice: 100,
      sku: `SYS-STRESS-${Date.now()}`
    }).returning();
    console.log(`[OK] Created Product ID: ${testProduct.id}`);

    // 3. Setup Variant
    const [newVariant] = await db.insert(productVariants).values({
      productId: testProduct.id,
      sku: `SYS-VAR-${Date.now()}`,
      stockQuantity: 1000000
    }).returning();
    console.log(`[OK] Created Variant ID: ${newVariant.id}`);

    // 4. Setup Initial Inventory Stock (Important for checkout so we don't hit negative stock errors)
    await db.insert(inventoryLedger).values({
      productId: testProduct.id,
      movementType: 'ADJUSTMENT',
      quantityChange: 1000000,
      notes: 'Initial stock for full system load test',
      createdBy: admin.id
    });
    console.log(`[OK] Seeded 1,000,000 stock`);

    // 5. Setup Customer
    let customerId = 1;
    const existingCustomer = await db.select().from(customers).limit(1);
    if (existingCustomer.length === 0) {
      const [newCust] = await db.insert(customers).values({ fullName: 'System Stress Tester', phone: '9999999999' }).returning();
      customerId = newCust.id;
    } else {
      customerId = existingCustomer[0].id;
    }
    console.log(`[OK] Associated Customer ID: ${customerId}`);

    // Pass environment variables to Artillery
    process.env.ARTILLERY_TOKEN = `Bearer ${token}`;
    process.env.ARTILLERY_ADMIN_ID = admin.id.toString();
    process.env.ARTILLERY_PRODUCT_ID = testProduct.id.toString();
    process.env.ARTILLERY_VARIANT_ID = newVariant.id.toString();
    process.env.ARTILLERY_CUSTOMER_ID = customerId.toString();

    console.log("\nStarting Artillery Full System Load Test...");
    try {
      execSync('npx artillery run full-stress-test.yml', { stdio: 'inherit' });
      console.log("\n[SUCCESS] Full System Stress Test Completed!");
    } catch (err: any) {
      console.error("\n[FAILED] Artillery test crashed:", err.message);
    }
  } catch (error) {
    console.error("\n[FAILED] Setup failed:", error);
  } finally {
    process.exit(0);
  }
}

runFullSystemStressTest().catch(console.error);
