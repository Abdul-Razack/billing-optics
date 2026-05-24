import { db } from '../config/db';
import {
  settings,
  users,
  categories,
  products,
  inventoryLedger,
  customers,
  prescriptions,
  invoices,
  invoiceItems,
  payments
} from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Starting database seeding...');

  try {
    console.log('Clearing existing data...');
    // Clear tables in reverse-dependency order
    await db.delete(payments);
    await db.delete(invoiceItems);
    await db.delete(invoices);
    await db.delete(prescriptions);
    await db.delete(inventoryLedger);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(customers);
    await db.delete(users);
    await db.delete(settings);
    console.log('Existing data cleared.');

    console.log('Seeding settings...');
    await db.insert(settings).values({
      id: 1,
      businessName: 'Optics POS',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    });
    console.log('Settings seeded.');

    console.log('Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const insertedUsers = await db.insert(users).values([
      {
        fullName: 'Admin User',
        email: 'admin@opticspos.com',
        passwordHash,
        role: 'ADMIN',
      },
      {
        fullName: 'Cashier User',
        email: 'cashier@opticspos.com',
        passwordHash,
        role: 'CASHIER',
      },
    ]).returning();
    const adminId = insertedUsers[0].id;
    console.log(`Users seeded (Admin: ${insertedUsers[0].email}, Cashier: ${insertedUsers[1].email}).`);

    console.log('Seeding categories...');
    const insertedCategories = await db.insert(categories).values([
      { name: 'Frames', description: 'Spectacle frames and sunglasses' },
      { name: 'Lenses', description: 'Ophthalmic lenses' },
    ]).returning();
    const framesCategory = insertedCategories.find((c) => c.name === 'Frames')!;
    const lensesCategory = insertedCategories.find((c) => c.name === 'Lenses')!;
    console.log('Categories seeded.');

    console.log('Seeding products...');
    const insertedProducts = await db.insert(products).values([
      {
        categoryId: framesCategory.id,
        name: 'Classic Aviator Frame',
        sku: 'FRM-AVI-001',
        barcode: '111111111111',
        costPrice: 50000,
        sellingPrice: 150000,
        gstPercent: 18,
        minStockAlert: 5,
      },
      {
        categoryId: framesCategory.id,
        name: 'Modern Wayfarer Frame',
        sku: 'FRM-WAY-002',
        barcode: '222222222222',
        costPrice: 60000,
        sellingPrice: 180000,
        gstPercent: 18,
        minStockAlert: 5,
      },
      {
        categoryId: lensesCategory.id,
        name: 'Single Vision Anti-Glare Lens',
        sku: 'LNS-SV-001',
        barcode: '333333333333',
        costPrice: 30000,
        sellingPrice: 80000,
        gstPercent: 12,
        minStockAlert: 10,
      },
      {
        categoryId: lensesCategory.id,
        name: 'Progressive Blue-Cut Lens',
        sku: 'LNS-PRO-002',
        barcode: '444444444444',
        costPrice: 120000,
        sellingPrice: 300000,
        gstPercent: 12,
        minStockAlert: 5,
      },
    ]).returning();
    console.log('Products seeded.');

    console.log('Seeding inventory ledger...');
    await db.insert(inventoryLedger).values(
      insertedProducts.map((p) => ({
        productId: p.id,
        movementType: 'PURCHASE' as const,
        quantityChange: 50,
        referenceType: 'ADJUSTMENT' as const,
        notes: 'Initial stock seeding',
        createdBy: adminId,
      }))
    );
    console.log('Inventory ledger seeded.');

    console.log('Seeding customers...');
    const insertedCustomers = await db.insert(customers).values([
      {
        fullName: 'John Doe',
        phone: '9876543210',
        email: 'john@example.com',
        gender: 'MALE',
        address: '123 Main Street',
      },
      {
        fullName: 'Jane Smith',
        phone: '8765432109',
        email: 'jane@example.com',
        gender: 'FEMALE',
        address: '456 Oak Avenue',
      },
    ]).returning();
    console.log('Customers seeded.');

    console.log('Seeding prescription...');
    await db.insert(prescriptions).values({
      customerId: insertedCustomers[0].id,
      rightEyeSph: '-1.50',
      rightEyeCyl: '-0.50',
      rightEyeAxis: 90,
      leftEyeSph: '-1.25',
      leftEyeCyl: '-0.75',
      leftEyeAxis: 95,
      addPower: '1.75',
      pd: '63.00',
      notes: 'Distance prescription',
      createdBy: adminId,
    });
    console.log('Prescription seeded.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

seed();
