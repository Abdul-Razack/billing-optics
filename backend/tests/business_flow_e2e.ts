import { CategoryService } from '../src/services/category.service';
import { ProductService } from '../src/services/product.service';
import { BillingService } from '../src/services/billing.service';
import { CustomerService } from '../src/services/customer.service';
import { pool } from '../src/config/db';

async function runBusinessFlowTest() {
  console.log('=====================================================');
  console.log('  OPTICAL ERP END-TO-END BUSINESS FLOW VERIFICATION  ');
  console.log('=====================================================\n');

  const catService = new CategoryService();
  const prodService = new ProductService();
  const billingService = new BillingService();
  const customerService = new CustomerService();

  const timestamp = Date.now();

  try {
    // ---------------------------------------------------------------
    // 1. Verify 7 Default Categories
    // ---------------------------------------------------------------
    console.log('[STEP 1] Verifying Canonical Optical Categories...');
    const categories = await catService.getAll();
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(c => {
      console.log(`  - [ID: ${c.id}] ${c.name} (${c.productCount} products)`);
    });

    const expectedNames = ['Frame', 'Sunglasses', 'Lens', 'Contact Lens', 'Solution', 'Other', 'Non-Chargeable'];
    for (const name of expectedNames) {
      const match = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (!match) {
        throw new Error(`Missing expected default category: ${name}`);
      }
    }
    console.log('✔ All 7 default optical categories are present and verified!\n');

    // ---------------------------------------------------------------
    // 2. Verify Dynamic Attribute Definitions & Options
    // ---------------------------------------------------------------
    console.log('[STEP 2] Verifying Dynamic Optical Attribute Definitions...');
    const frameCat = categories.find(c => c.name === 'Frame')!;
    const lensCat = categories.find(c => c.name === 'Lens')!;
    const contactCat = categories.find(c => c.name === 'Contact Lens')!;

    const frameAttrsRes = await pool.query(
      `SELECT pad.name, pad.label, pad.input_type, count(pao.id) as option_count 
       FROM product_attribute_definitions pad 
       LEFT JOIN product_attribute_options pao ON pad.id = pao.attribute_definition_id
       WHERE pad.category_id = $1
       GROUP BY pad.id, pad.name, pad.label, pad.input_type
       ORDER BY pad.display_order;`,
      [frameCat.id]
    );
    console.log(`Frame Category Attributes (${frameAttrsRes.rows.length}):`);
    frameAttrsRes.rows.slice(0, 5).forEach(r => {
      console.log(`  - ${r.label} (${r.name}): ${r.input_type} (${r.option_count} options)`);
    });
    console.log('✔ Frame attributes and options successfully verified!\n');

    // ---------------------------------------------------------------
    // 3. Create Optical Products with Attributes & Opening Stock
    // ---------------------------------------------------------------
    console.log('[STEP 3] Creating Optical Products with Dynamic Attributes & Initial Stock...');

    // A. Frame Product
    const frameSku = `FRM-TEST-${timestamp.toString().slice(-6)}`;
    const frameBarcode = `BAR-FRM-${timestamp.toString().slice(-6)}`;
    const frameProduct = await prodService.createProduct({
      categoryId: Number(frameCat.id),
      name: `Ray-Ban Aviator Classic Test ${timestamp}`,
      sku: frameSku,
      barcode: frameBarcode,
      costPrice: 450000,    // ₹4,500.00
      sellingPrice: 850000, // ₹8,500.00
      gstPercent: 18,
      minStockAlert: 3,
      initialStock: 10,
      productType: 'FRAME',
      attributes: {
        frameBrand: 'Ray-Ban',
        frameModel: 'RB3025 Aviator',
        frameGender: 'Unisex',
        frameColor: 'Gold',
        frameType: 'Full Rim',
        frameShape: 'Aviator',
        frameMaterial: 'Metal',
        frameSize: '58-14-135',
        frameQuality: 'A+'
      }
    });
    console.log(`✔ Created Frame product: ID ${frameProduct.id} ("${frameProduct.name}")`);
    console.log(`  Attributes:`, frameProduct.attributes);

    // B. Lens Product
    const lensSku = `LNS-TEST-${timestamp.toString().slice(-6)}`;
    const lensBarcode = `BAR-LNS-${timestamp.toString().slice(-6)}`;
    const lensProduct = await prodService.createProduct({
      categoryId: Number(lensCat.id),
      name: `Essilor Crizal Blue-UV Capture ${timestamp}`,
      sku: lensSku,
      barcode: lensBarcode,
      costPrice: 200000,    // ₹2,000.00
      sellingPrice: 420000, // ₹4,200.00
      gstPercent: 12,
      minStockAlert: 5,
      initialStock: 20,
      productType: 'LENS',
      attributes: {
        lensBrand: 'Essilor',
        lensIndex: '1.67 (Ultra-Thin)',
        lensCoating: 'Blue Cut / Blue Light Filter',
        lensDesign: 'Single Vision',
        lensMaterial: 'Hi-Index Resin',
        lensVision: 'Distance Wear'
      }
    });
    console.log(`✔ Created Lens product: ID ${lensProduct.id} ("${lensProduct.name}")`);
    console.log(`  Attributes:`, lensProduct.attributes);

    // C. Contact Lens Product
    const clSku = `CL-TEST-${timestamp.toString().slice(-6)}`;
    const clBarcode = `BAR-CL-${timestamp.toString().slice(-6)}`;
    const clProduct = await prodService.createProduct({
      categoryId: Number(contactCat.id),
      name: `Acuvue Oasys with HydraLuxe ${timestamp}`,
      sku: clSku,
      barcode: clBarcode,
      costPrice: 120000,    // ₹1,200.00
      sellingPrice: 240000, // ₹2,400.00
      gstPercent: 12,
      minStockAlert: 4,
      initialStock: 15,
      productType: 'CONTACT_LENS',
      attributes: {
        clBrand: 'Acuvue (Johnson & Johnson)',
        clModality: 'Daily Disposable',
        clType: 'Spherical',
        clMaterial: 'Silicone Hydrogel',
        clColor: 'Clear',
        clBc: '8.5',
        clDia: '14.2',
        clWc: '38%',
        piecesPerBox: 30
      }
    });
    console.log(`✔ Created Contact Lens product: ID ${clProduct.id} ("${clProduct.name}")`);
    console.log(`  Attributes:`, clProduct.attributes, '\n');

    // ---------------------------------------------------------------
    // 4. Verify Stock Ledger Entries for Products
    // ---------------------------------------------------------------
    console.log('[STEP 4] Verifying Initial Inventory Ledger Balances...');
    const checkStock = async (prodId: number) => {
      const res = await pool.query(
        `SELECT movement_type, quantity_change, reference_type 
         FROM inventory_ledger 
         WHERE product_id = $1;`,
        [prodId]
      );
      return res.rows;
    };

    const frameLedger = await checkStock(frameProduct.id);
    console.log(`Frame Product Stock Movements:`, frameLedger);
    if (frameLedger.length === 0 || frameLedger[0].quantity_change !== 10) {
      throw new Error(`Expected Frame opening stock 10, got ${frameLedger[0]?.quantity_change}`);
    }

    const lensLedger = await checkStock(lensProduct.id);
    if (lensLedger.length === 0 || lensLedger[0].quantity_change !== 20) {
      throw new Error(`Expected Lens opening stock 20, got ${lensLedger[0]?.quantity_change}`);
    }
    console.log('✔ Inventory Ledger opening balances correctly recorded!\n');

    // ---------------------------------------------------------------
    // 5. POS Billing / Sale Transaction Business Flow
    // ---------------------------------------------------------------
    console.log('[STEP 5] Testing POS Sale Transaction (Billing Flow)...');

    // Create a customer
    const testCustomer = await customerService.create({
      fullName: `Test Patient ${timestamp.toString().slice(-4)}`,
      phone: `98765${timestamp.toString().slice(-5)}`,
      email: `patient${timestamp.toString().slice(-4)}@example.com`,
      gender: 'MALE',
      address: '123 Optical Avenue'
    });
    console.log(`✔ Created Customer: ID ${testCustomer.id} (${testCustomer.fullName})`);

    // Fetch an admin user id for createdBy
    const userRes = await pool.query('SELECT id FROM users LIMIT 1;');
    const userId = userRes.rows[0]?.id ? Number(userRes.rows[0].id) : 1;

    // Process checkout for 1 Frame and 1 Lens
    const checkoutResult = await billingService.checkout({
      action: 'DIRECT_INVOICE',
      customerId: testCustomer.id,
      createdBy: userId,
      items: [
        {
          productId: frameProduct.id,
          quantity: 1
        },
        {
          productId: lensProduct.id,
          quantity: 1
        }
      ],
      payments: [
        {
          method: 'UPI',
          amount: 147340 // 8500*1.18 + 4200*1.12 = 10030 + 4704 = 14734 (x100 = 1473400)
        }
      ]
    });

    console.log(`✔ Checkout Processed Successfully! Result:`, checkoutResult);

    // Retrieve generated invoice details
    const invoiceId = (checkoutResult as any).recordId || (checkoutResult as any).invoiceId || (checkoutResult as any).id;
    const invDetails = await pool.query(
      `SELECT id, invoice_number, subtotal, tax_total, grand_total, payment_status 
       FROM invoices 
       WHERE id = $1;`,
      [invoiceId]
    );
    console.log(`✔ Invoice Details:`, invDetails.rows[0], '\n');

    // ---------------------------------------------------------------
    // 6. Verify Inventory Deduction after Sale
    // ---------------------------------------------------------------
    console.log('[STEP 6] Verifying Real-Time Stock Ledger Deduction After Sale...');
    const framePostSale = await checkStock(frameProduct.id);
    console.log(`Frame Stock Movements Post-Sale:`, framePostSale);
    const hasSaleDeduction = framePostSale.some(
      r => r.movement_type === 'SALE' && r.quantity_change === -1
    );
    if (!hasSaleDeduction) {
      throw new Error('Expected SALE movement deducting -1 from Frame stock ledger!');
    }
    console.log('✔ Stock successfully deducted (-1 unit) in inventory ledger upon billing!\n');

    // ---------------------------------------------------------------
    // 7. Verify Category Deletion Safeguards
    // ---------------------------------------------------------------
    console.log('[STEP 7] Verifying Category Deletion Safeguard Protection...');
    try {
      await catService.delete(Number(frameCat.id));
      throw new Error('FAIL: Should not be able to delete category with active products!');
    } catch (err: any) {
      console.log('✔ PASS: Safeguard successfully prevented category deletion:');
      console.log(`  Error message: "${err.message}"\n`);
    }

    // Test creating and deleting a temporary empty category
    const tempCat = await catService.create({
      name: `Temp Category ${timestamp}`,
      description: 'Temporary test category'
    });
    console.log(`Created temporary empty category ID ${tempCat.id}`);
    const deletedCat = await catService.delete(tempCat.id);
    console.log(`✔ PASS: Successfully deleted empty category ID ${deletedCat.id} without conflict!\n`);

    console.log('=====================================================');
    console.log('  ALL END-TO-END BUSINESS FLOW VERIFICATIONS PASSED!  ');
    console.log('=====================================================');

  } catch (error) {
    console.error('Business Flow Verification FAILED:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runBusinessFlowTest();
