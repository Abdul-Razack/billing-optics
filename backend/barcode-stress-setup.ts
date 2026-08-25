import * as jwt from 'jsonwebtoken';
import { db } from './src/config/db';
import { users, productVariants, products, categories } from './src/db/schema';
import { eq, isNotNull } from 'drizzle-orm';
import env from './src/config/env';
import { execSync } from 'child_process';

async function runBarcodeStressTest() {
  console.log("Setting up Barcode Stress Test...");
  try {
    const adminUsers = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
    if (adminUsers.length === 0) {
      console.error('No admin user found.');
      process.exit(1);
    }

    const admin = adminUsers[0];
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );
    console.log(`Generated Admin Token`);

    const variant = await db.select().from(productVariants).limit(1);
    let pVariantId = 1;
    if (variant.length > 0) {
      pVariantId = variant[0].id;
    } else {
      const existingCategory = await db.select().from(categories).limit(1);
      const catId = existingCategory.length > 0 ? existingCategory[0].id : (await db.insert(categories).values({ name: 'Stress Test Category' }).returning())[0].id;

      const [testProduct] = await db.insert(products).values({
        name: 'Stress Test Item',
        categoryId: catId,
        costPrice: 10,
        sellingPrice: 20,
        sku: `STRESS-${Date.now()}`
      }).returning();

      const [newVariant] = await db.insert(productVariants).values({
        productId: testProduct.id,
        sku: `STRESS-VAR-${Date.now()}`,
        stockQuantity: 100
      }).returning();
      pVariantId = newVariant.id;
    }

    process.env.ARTILLERY_TOKEN = `Bearer ${token}`;
    process.env.ARTILLERY_PRODUCT_VARIANT_ID = pVariantId.toString();

    console.log("Starting Artillery Stress Test for Barcodes...");
    try {
      execSync('npx artillery run barcode-stress-test.yml', { stdio: 'inherit' });
      console.log("Barcode Stress Test Completed Successfully!");
    } catch (err: any) {
      console.error("Artillery test failed:", err.message);
    }
  } catch (error) {
    console.error("Setup failed:", error);
  } finally {
    process.exit(0);
  }
}

runBarcodeStressTest().catch(console.error);
