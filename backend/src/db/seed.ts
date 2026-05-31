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
    const productTemplates = [
      { name: 'Classic Aviator Frame', categoryId: framesCategory.id, skuPrefix: 'FRM-AVI', costPrice: 50000, sellingPrice: 150000, gstPercent: 18 },
      { name: 'Modern Wayfarer Frame', categoryId: framesCategory.id, skuPrefix: 'FRM-WAY', costPrice: 60000, sellingPrice: 180000, gstPercent: 18 },
      { name: 'Single Vision Anti-Glare Lens', categoryId: lensesCategory.id, skuPrefix: 'LNS-SV', costPrice: 30000, sellingPrice: 80000, gstPercent: 12 },
      { name: 'Progressive Blue-Cut Lens', categoryId: lensesCategory.id, skuPrefix: 'LNS-PRO', costPrice: 120000, sellingPrice: 300000, gstPercent: 12 }
    ];

    const productsToInsert = [];
    for (let i = 1; i <= 100; i++) {
      const template = productTemplates[(i - 1) % productTemplates.length];
      productsToInsert.push({
        categoryId: template.categoryId,
        name: `${template.name} ${i}`,
        sku: `${template.skuPrefix}-${String(i).padStart(3, '0')}`,
        barcode: String(100000000000 + i).padStart(12, '0'),
        costPrice: template.costPrice,
        sellingPrice: template.sellingPrice,
        gstPercent: template.gstPercent,
        minStockAlert: 5,
      });
    }

    const insertedProducts = await db.insert(products).values(productsToInsert).returning();
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
    const customersToInsert = [];
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 'Robert', 'Karen'];
    const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Williams', 'Miller', 'Jones', 'Davis', 'Wilson', 'Anderson'];
    
    for (let i = 1; i <= 100; i++) {
      const firstName = firstNames[(i - 1) % firstNames.length];
      const lastName = lastNames[(i - 1) % lastNames.length];
      customersToInsert.push({
        fullName: `${firstName} ${lastName} ${i}`,
        phone: String(9876543000 + i),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
        gender: i % 2 === 0 ? ('MALE' as const) : ('FEMALE' as const),
        address: `${i} Main Street, Apt ${i}`,
      });
    }

    const insertedCustomers = await db.insert(customers).values(customersToInsert).returning();
    console.log('Customers seeded.');

    console.log('Seeding prescription...');
    const prescriptionsToInsert = [];
    for (let i = 0; i < insertedCustomers.length; i++) {
      prescriptionsToInsert.push({
        customerId: insertedCustomers[i].id,
        rightEyeSph: '-1.50',
        rightEyeCyl: '-0.50',
        rightEyeAxis: 90,
        leftEyeSph: '-1.25',
        leftEyeCyl: '-0.75',
        leftEyeAxis: 95,
        addPower: '1.75',
        pd: '63.00',
        notes: `Distance prescription for customer ${i + 1}`,
        createdBy: adminId,
      });
    }
    await db.insert(prescriptions).values(prescriptionsToInsert);
    console.log('Prescriptions seeded.');

    console.log('Seeding invoices...');
    const invoicesToInsert = [];
    const invoiceItemsToInsert = [];
    const paymentsToInsert = [];
    let invoiceCounter = 1;

    for (let i = 0; i < insertedCustomers.length; i++) {
      const customer = insertedCustomers[i];
      // Create 1-2 invoices for each customer
      const numInvoices = (i % 2) + 1;
      
      for (let j = 0; j < numInvoices; j++) {
        const product = insertedProducts[(i + j) % insertedProducts.length];
        const quantity = 1;
        const subtotal = product.sellingPrice * quantity;
        const taxTotal = Math.round((subtotal * product.gstPercent) / 100);
        const grandTotal = subtotal + taxTotal;
        const amountPaid = grandTotal;

        invoicesToInsert.push({
          invoiceNumber: `INV-2026-${String(invoiceCounter).padStart(5, '0')}`,
          customerId: customer.id,
          createdBy: adminId,
          subtotal,
          taxTotal,
          discountTotal: 0,
          grandTotal,
          amountPaid,
          paymentStatus: 'PAID' as const,
          createdAt: new Date(Date.now() - Math.random() * 10000000000), // Random past date
        });
        invoiceCounter++;
      }
    }

    const insertedInvoices = await db.insert(invoices).values(invoicesToInsert).returning();

    for (let i = 0; i < insertedInvoices.length; i++) {
      const invoice = insertedInvoices[i];
      // For simplicity, match back the product using the loop index (this is just mock data)
      const product = insertedProducts[i % insertedProducts.length];
      
      invoiceItemsToInsert.push({
        invoiceId: invoice.id,
        productId: product.id,
        snapshotName: product.name,
        snapshotSku: product.sku || '',
        snapshotPrice: product.sellingPrice,
        snapshotCostPrice: product.costPrice,
        snapshotTaxPercent: product.gstPercent,
        quantity: 1,
        lineTotal: invoice.subtotal,
      });

      paymentsToInsert.push({
        invoiceId: invoice.id,
        amount: invoice.amountPaid,
        paymentMethod: 'CASH' as const,
      });
    }

    await db.insert(invoiceItems).values(invoiceItemsToInsert);
    await db.insert(payments).values(paymentsToInsert);
    console.log('Invoices seeded.');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

seed();
