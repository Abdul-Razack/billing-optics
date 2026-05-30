import { ReportRepository } from './src/repositories/report.repository';
import { db } from './src/config/db';

async function main() {
  try {
    const start = new Date(0);
    const end = new Date();
    const result = await ReportRepository.getSalesAnalytics(start, end);
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
}
main();
