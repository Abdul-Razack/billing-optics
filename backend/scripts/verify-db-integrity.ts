import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';
import { products, stockBalances, invoiceItems, invoices, customers } from '../src/db/schema';

async function verifyIntegrity() {
  console.log('Starting Database Integrity Check...');
  let hasErrors = false;

  try {
    // 1. Check for negative stock balances
    console.log('\n1. Checking for negative stock balances...');
    const negativeStock = await db.execute(
      sql`SELECT * FROM ${stockBalances} WHERE quantity < 0`
    );
    if (negativeStock.rows.length > 0) {
      console.error(`[FAIL] Found ${negativeStock.rows.length} records with negative stock!`);
      hasErrors = true;
    } else {
      console.log('[OK] No negative stock balances found.');
    }

    // 2. Check for orphaned invoice items
    console.log('\n2. Checking for orphaned invoice items...');
    const orphanedItems = await db.execute(
      sql`SELECT ii.id FROM ${invoiceItems} ii LEFT JOIN ${invoices} i ON ii.invoice_id = i.id WHERE i.id IS NULL`
    );
    if (orphanedItems.rows.length > 0) {
      console.error(`[FAIL] Found ${orphanedItems.rows.length} orphaned invoice items!`);
      hasErrors = true;
    } else {
      console.log('[OK] No orphaned invoice items found.');
    }

    // 3. Check for invoices without customers
    console.log('\n3. Checking for invoices with invalid customer references...');
    const invalidInvoices = await db.execute(
      sql`SELECT i.id FROM ${invoices} i LEFT JOIN ${customers} c ON i.customer_id = c.id WHERE c.id IS NULL`
    );
    if (invalidInvoices.rows.length > 0) {
      console.error(`[FAIL] Found ${invalidInvoices.rows.length} invoices with invalid customers!`);
      hasErrors = true;
    } else {
      console.log('[OK] All invoices have valid customers.');
    }

  } catch (error) {
    console.error('[ERROR] Integrity check failed to run:', error);
    hasErrors = true;
  } finally {
    console.log('\n=======================================');
    if (hasErrors) {
      console.log('[RESULT] Database Integrity Check FAILED. Anomalies detected.');
      process.exit(1);
    } else {
      console.log('[RESULT] Database Integrity Check PASSED. DB is robust and normalized.');
      process.exit(0);
    }
  }
}

verifyIntegrity();
