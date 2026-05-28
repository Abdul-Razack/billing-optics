import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import billingRoutes from './routes/billing.routes';
import inventoryRoutes from './routes/inventory.routes';
import reportRoutes from './routes/report.routes';
import systemRoutes from './routes/system.routes';
import userRoutes from './routes/user.routes';
import settingsRoutes from './routes/settings.routes';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', systemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
