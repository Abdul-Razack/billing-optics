import { db } from './src/config/db';
import { users, products, categories, customers, inventoryLedger } from './src/db/schema';
import { eq, desc } from 'drizzle-orm';
import * as jwt from 'jsonwebtoken';
import env from './src/config/env';

const API_URL = 'http://127.0.0.2:5000/api';

async function runE2ETest() {
  console.log('\n🚀 Starting End-to-End Purchase Flow Test...');

  // 1. Generate Admin Token directly from DB
  const adminUsers = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
  if (adminUsers.length === 0) throw new Error('No admin user found');
  const admin = adminUsers[0];
  const token = jwt.sign(
    { userId: admin.id, role: admin.role },
    env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
  console.log(`✅ [Setup] Admin Token Generated for: ${admin.fullName}`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Create a Category via API
  const categoryRes = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: `E2E Category ${Date.now()}` })
  });
  if (!categoryRes.ok) throw new Error(`Category creation failed: ${await categoryRes.text()}`);
  const categoryData = await categoryRes.json();
  const categoryId = categoryData.data.id;
  console.log(`✅ [Step 1] Created Category: ${categoryId}`);

  // 3. Create a Product with Initial Stock via API
  const productRes = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: `E2E Product ${Date.now()}`,
      categoryId,
      costPrice: 50,
      sellingPrice: 100,
      sku: `E2E-${Date.now()}`
    })
  });
  if (!productRes.ok) throw new Error(`Product creation failed: ${await productRes.text()}`);
  const productData = await productRes.json();
  const productId = productData.data.id;
  console.log(`✅ [Step 2] Created Product: ${productId}`);

  // 3b. Add 100 Stock to Product via API
  const adjustRes = await fetch(`${API_URL}/inventory/adjust`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      productId,
      adjustmentType: 'IN',
      quantity: 100,
      notes: 'Initial stock for E2E testing'
    })
  });
  if (!adjustRes.ok) throw new Error(`Inventory adjustment failed: ${await adjustRes.text()}`);
  console.log(`✅ [Step 2b] Added 100 Stock to Product: ${productId}`);

  // 4. Create a Customer via API
  const customerRes = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: `E2E Customer ${Date.now()}`,
      phone: `${Date.now()}`.slice(0, 10), // Random 10 digit phone
    })
  });
  if (!customerRes.ok) throw new Error(`Customer creation failed: ${await customerRes.text()}`);
  const customerData = await customerRes.json();
  const customerId = customerData.data.id;
  console.log(`✅ [Step 3] Created Customer: ${customerId}`);

  // 5. Perform Checkout of 2 items via API
  const checkoutRes = await fetch(`${API_URL}/invoices/${Date.now()}-req/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customerId,
      items: [
        { productId, quantity: 2 } // Buying 2 items!
      ],
      payments: [
        { method: "CASH", amount: 200 }
      ]
    })
  });
  if (!checkoutRes.ok) throw new Error(`Checkout failed: ${await checkoutRes.text()}`);
  const checkoutData = await checkoutRes.json();
  const invoiceId = checkoutData.data.id;
  console.log(`✅ [Step 4] Checkout Successful! Invoice ID: ${invoiceId}`);

  // 6. Direct DB Verification (The mathematical proof)
  console.log('\n🔍 Verifying Database Integrity...');
  
  // Verify Ledger Subtraction
  const ledgerEntries = await db.select().from(inventoryLedger).where(eq(inventoryLedger.productId, productId)).orderBy(desc(inventoryLedger.createdAt));
  
  // We expect 2 entries: 
  // 1) The initial stock of 100 (+100)
  // 2) The sale of 2 (-2)
  let saleEntryFound = false;
  let currentCalculatedStock = 0;

  for (const entry of ledgerEntries) {
    currentCalculatedStock += entry.quantityChange;
    if (entry.movementType === 'SALE' && entry.quantityChange === -2) {
      saleEntryFound = true;
    }
  }

  if (saleEntryFound) {
    console.log(`✅ [Verification 1] Found exact -2 SALE entry in inventory_ledger!`);
  } else {
    throw new Error('Verification Failed: Could not find the -2 SALE entry in ledger.');
  }

  if (currentCalculatedStock === 98) {
    console.log(`✅ [Verification 2] Mathematical stock calculation is exactly 98! (100 - 2)`);
  } else {
    throw new Error(`Verification Failed: Expected 98 stock, got ${currentCalculatedStock}`);
  }

  console.log('\n🎉 ALL E2E TESTS PASSED PERFECTLY!');
  process.exit(0);
}

runE2ETest().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
