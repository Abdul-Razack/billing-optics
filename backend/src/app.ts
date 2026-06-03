import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './middleware/error.middleware';
import env from './config/env';
import { BootstrapContext } from './bootstrap';

import { createAuthRoutes } from './routes/auth.routes';
import { createCustomerRoutes } from './routes/customer.routes';
import { createCategoryRoutes } from './routes/category.routes';
import { createProductRoutes } from './routes/product.routes';
import { createBillingRoutes } from './routes/billing.routes';
import { createPaymentRoutes } from './routes/payment.routes';
import { createInventoryRoutes } from './routes/inventory.routes';
import { createReportRoutes } from './routes/report.routes';
import { createSystemRoutes } from './routes/system.routes';
import { createUserRoutes } from './routes/user.routes';
import { createSettingsRoutes } from './routes/settings.routes';
import { createPrescriptionRoutes } from './routes/prescription.routes';
import { createExportRoutes } from './routes/export.routes';
import { createBackupRoutes } from './routes/backup.routes';
import { createHealthRoutes } from './routes/health.routes';
import { createMaintenanceRoutes } from './routes/maintenance.routes';
import { createLicenseRoutes } from './routes/license.routes';
import { createAuditRoutes } from './routes/audit.routes';
import { requireLicense } from './middleware/license.middleware';

export function buildApp(context: BootstrapContext) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '1mb' }));

  // Global rate limiter for API routes
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', globalLimiter);

  // API Routes
  app.use('/api', createSystemRoutes());
  app.use('/api/auth', createAuthRoutes());
  app.use('/api/license', createLicenseRoutes());

  // Apply License Protection Middleware to all subsequent routes
  app.use('/api', requireLicense);

  app.use('/api/customers', createCustomerRoutes());
  app.use('/api/categories', createCategoryRoutes());
  app.use('/api/products', createProductRoutes());
  app.use('/api/invoices', createBillingRoutes());
  app.use('/api/payments', createPaymentRoutes());
  app.use('/api/prescriptions', createPrescriptionRoutes());
  app.use('/api/inventory', createInventoryRoutes());
  app.use('/api/reports', createReportRoutes());
  app.use('/api/users', createUserRoutes());
  app.use('/api/settings', createSettingsRoutes());
  app.use('/api/exports', createExportRoutes());
  app.use('/api/backups', createBackupRoutes());
  app.use('/api/system-health', createHealthRoutes());
  app.use('/api/database-maintenance', createMaintenanceRoutes());
  app.use('/api/audit-logs', createAuditRoutes());

  // Global Error Handler
  app.use(errorMiddleware);

  return app;
}
