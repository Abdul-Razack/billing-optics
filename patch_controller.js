const fs = require('fs');
const path = require('path');
const controllerPath = path.join(__dirname, 'backend/src/controllers/report.controller.ts');
let content = fs.readFileSync(controllerPath, 'utf8');

const categoryMethod = `
  static async getCategoryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;

      const result = await ReportService.getCategoryReport(startDate, endDate);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
`;

content = content.replace("static async getRevenueReport(req: Request, res: Response, next: NextFunction) {", categoryMethod + "\\n  static async getRevenueReport(req: Request, res: Response, next: NextFunction) {");
fs.writeFileSync(controllerPath, content);
