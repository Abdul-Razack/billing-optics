const fs = require('fs');
const path = require('path');
const servicePath = path.join(__dirname, 'backend/src/services/report.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

const categoryMethod = `
  static async getCategoryReport(startDate?: Date, endDate?: Date) {
    if (startDate && endDate && startDate > endDate) {
      throw new ValidationError('startDate cannot be after endDate');
    }
    return await ReportRepository.getCategoryAnalytics(startDate, endDate);
  }
`;

content = content.replace("static async getLowStockReport() {", categoryMethod + "\\n  static async getLowStockReport() {");
fs.writeFileSync(servicePath, content);
