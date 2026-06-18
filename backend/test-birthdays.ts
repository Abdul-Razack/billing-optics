import { db } from './src/config/db';
import { CustomerRepository } from './src/repositories/customer.repository';

async function main() {
  try {
    const result = await CustomerRepository.findBirthdays(6);
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit();
}

main();
