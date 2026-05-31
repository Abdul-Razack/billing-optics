import { sql, between } from 'drizzle-orm';
import { ReportRepository } from './src/repositories/report.repository';
import { db } from './src/config/db';
import { invoices } from './src/db/schema';

async function run() {
  try {
    const dateTruncUnit = 'day';
    const trends = await db
      .select({
        period: sql<string>`date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${invoices.createdAt})`,
        sales: sql<number>`COALESCE(SUM(${invoices.grandTotal}), 0)`.mapWith(Number),
      })
      .from(invoices)
      .where(between(invoices.createdAt, new Date('2024-01-01'), new Date('2026-12-31')))
      .groupBy(sql`1`) // Group by the 1st column in SELECT to avoid expression mismatch!
      .orderBy(sql`1`); 
    console.log(trends);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
