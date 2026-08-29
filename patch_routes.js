const fs = require('fs');
const path = require('path');
const routesPath = path.join(__dirname, 'backend/src/routes/report.routes.ts');
let content = fs.readFileSync(routesPath, 'utf8');

content = content.replace("router.get('/customers', auth, checkRole(['ADMIN', 'MANAGER', 'OPTOMETRIST']), ReportController.getCustomerReport);", 
  "router.get('/customers', auth, checkRole(['ADMIN', 'MANAGER', 'OPTOMETRIST']), ReportController.getCustomerReport);\\n" +
  "router.get('/categories', auth, checkRole(['ADMIN', 'MANAGER', 'OPTOMETRIST']), ReportController.getCategoryReport);");

fs.writeFileSync(routesPath, content);
