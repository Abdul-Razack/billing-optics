import { db } from './src/config/db';
import { customers } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
  console.log("Seeding Customer Data for Marketing Hub...");
  
  const today = new Date();
  
  try {
    // Insert a customer with a birthday this month
    await db.insert(customers).values({
      fullName: 'Birthday Customer',
      email: `bday_${Date.now()}@test.com`,
      phone: `111-${Date.now().toString().slice(-4)}`,
      dateOfBirth: today, // Today's date!
      loyaltyPoints: 50
    });

    // Insert a customer with an anniversary this month
    await db.insert(customers).values({
      fullName: 'Anniversary Customer',
      email: `anniv_${Date.now()}@test.com`,
      phone: `222-${Date.now().toString().slice(-4)}`,
      anniversaryDate: today, // Today's date!
      loyaltyPoints: 100
    });

    // Insert a customer with do-not-disturb
    await db.insert(customers).values({
      fullName: 'DND Customer',
      email: `dnd_${Date.now()}@test.com`,
      phone: `333-${Date.now().toString().slice(-4)}`,
      isDnd: true
    });

    console.log("[SUCCESS] Seeded customers for Marketing Hub!");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    process.exit(0);
  }
}

run();
