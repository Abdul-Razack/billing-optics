import { db } from './src/config/db';
import { settings } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
  const [s] = await db.select().from(settings).limit(1);
  console.log("Settings customFieldDefinitions:", s?.customFieldDefinitions);
  process.exit(0);
}
run();
