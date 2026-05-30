import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './middleware/error.middleware';
import env from './config/env';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import billingRoutes from './routes/billing.routes';
import paymentRoutes from './routes/payment.routes';
import inventoryRoutes from './routes/inventory.routes';
import reportRoutes from './routes/report.routes';
import systemRoutes from './routes/system.routes';
import userRoutes from './routes/user.routes';
import settingsRoutes from './routes/settings.routes';
import prescriptionRoutes from './routes/prescription.routes';
import exportRoutes from './routes/export.routes';
import backupRoutes from './routes/backup.routes';

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
app.use('/api', systemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', billingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/backups', backupRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
