import { db } from './src/config/db';
import { users, productVariants } from './src/db/schema';
import { BarcodeService } from './src/services/barcode.service';

async function run() {
  const variant = await db.select().from(productVariants).limit(1);
  const pId = variant.length > 0 ? variant[0].id : 1;
  try {
    const res = await BarcodeService.generateBarcodes({ productVariantId: pId, quantity: 5 });
    console.log('Success:', res);
  } catch (e: any) {
    console.log('ERROR:', e);
  }
  process.exit(0);
}
run();
