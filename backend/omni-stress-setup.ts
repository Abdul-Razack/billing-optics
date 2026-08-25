import * as jwt from 'jsonwebtoken';
import { db } from './src/config/db';
import { 
  users, productVariants, products, categories, customers, 
  inventoryLedger, vendors, prescriptions, invoices, labJobs, offers 
} from './src/db/schema';
import { eq } from 'drizzle-orm';
import env from './src/config/env';
import { execSync } from 'child_process';

async function runOmniStressTest() {
  console.log("Setting up Omni-Module Stress Test...");
  try {
    const adminUsers = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
    if (adminUsers.length === 0) {
      console.error('No admin user found. Cannot proceed.');
      process.exit(1);
    }
    const admin = adminUsers[0];
    const token = jwt.sign({ userId: admin.id, role: admin.role }, env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

    // 1. Customer
    const [customer] = await db.insert(customers).values({
      fullName: 'Omni Customer',
      email: `omni_${Date.now()}@test.com`,
      phone: `555-${Date.now().toString().slice(-4)}`
    }).returning();
    
    // 2. Vendor
    const [vendor] = await db.insert(vendors).values({ name: 'Omni Vendor', contactPerson: 'John', phone: '1234567890' }).returning();

    // 3. Category & Product & Variant & Stock
    const [category] = await db.insert(categories).values({
      name: `Omni Category ${Date.now()}`
    }).returning();
    const [product] = await db.insert(products).values({ name: `Omni Frame ${Date.now()}`, categoryId: category.id, costPrice: 20, sellingPrice: 150, sku: `OMNI-${Date.now()}` }).returning();
    const [variant] = await db.insert(productVariants).values({ productId: product.id, sku: `OMNIVAR-${Date.now()}`, stockQuantity: 999999 }).returning();
    
    await db.insert(inventoryLedger).values({
      productId: product.id, movementType: 'ADJUSTMENT', quantityChange: 999999, notes: 'Omni setup', createdBy: admin.id
    });

    // 4. Prescription
    const [prescription] = await db.insert(prescriptions).values({
      customerId: customer.id,
      prescriptionType: 'EYEWEAR',
      createdBy: admin.id
    }).returning();

    // 5. Offer
    const [offer] = await db.insert(offers).values({
      name: 'Omni Test Offer',
      code: `OMNI-${Date.now()}`,
      type: 'PERCENTAGE',
      value: 10,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000)
    }).returning();

    // 6. Base Invoice & Lab Job
    const [invoice] = await db.insert(invoices).values({
      invoiceNumber: `INV-OMNI-${Date.now()}`,
      customerId: customer.id,
      createdBy: admin.id,
      subtotal: 150,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: 150,
      paymentStatus: 'PAID'
    }).returning();

    const [labJob] = await db.insert(labJobs).values({
      invoiceId: invoice.id,
      jobTitle: 'Omni Test Lens Fitting',
      status: 'PENDING'
    }).returning();

    const [adminUser] = await db.insert(users).values({
      fullName: 'Omni Admin',
      email: `omni_admin_${Date.now()}@test.com`,
      passwordHash: 'dummy',
      role: 'ADMIN'
    }).returning();

    console.log("[OK] Seed data provisioned successfully.");

    process.env.ARTILLERY_TOKEN = `Bearer ${token}`;
    process.env.ARTILLERY_ADMIN_ID = admin.id.toString();
    process.env.ARTILLERY_CUSTOMER_ID = customer.id.toString();
    process.env.ARTILLERY_VENDOR_ID = vendor.id.toString();
    process.env.ARTILLERY_PRODUCT_ID = product.id.toString();
    process.env.ARTILLERY_VARIANT_ID = variant.id.toString();
    process.env.ARTILLERY_PRESCRIPTION_ID = prescription.id.toString();
    process.env.ARTILLERY_OFFER_CODE = offer.code || '';
    process.env.ARTILLERY_INVOICE_ID = invoice.id.toString();
    process.env.ARTILLERY_LAB_JOB_ID = labJob.id.toString();

    console.log("Starting Artillery Omni-Module Load Test...");
    try {
      execSync('npx artillery run omni-stress-test.yml', { stdio: 'inherit' });
      console.log("\n[SUCCESS] Omni-Module Stress Test Completed!");
    } catch (err: any) {
      console.error("\n[FAILED] Artillery test crashed:", err.message);
    }
  } catch (error) {
    console.error("\n[FAILED] Setup failed:", error);
  } finally {
    process.exit(0);
  }
}

runOmniStressTest().catch(console.error);
