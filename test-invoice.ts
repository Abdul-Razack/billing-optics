import { db } from './backend/src/config/db';
import { BillingRepository } from './backend/src/repositories/billing.repository';

async function main() {
  try {
    const result = await BillingRepository.getInvoiceWithItemsAndPayments(1);
    console.log(JSON.stringify(result, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
main();
