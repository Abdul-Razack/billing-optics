import request from 'supertest';
import { buildApp } from '../../app';
import { productService } from '../../services/product.service';
import { AuditService } from '../../services/audit.service';

// Mock the services
jest.mock('../../services/product.service');
jest.mock('../../services/audit.service');

// Mock auth middleware to bypass JWT validation and database checks
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // Inject a fake user payload
    req.user = { id: 1, role: 'ADMIN' };
    next();
  }
}));

// Mock role middleware
jest.mock('../../middleware/role.middleware', () => ({
  authorizeRoles: (...allowedRoles: string[]) => {
    return (req: any, res: any, next: any) => next();
  }
}));

// Mock license middleware
jest.mock('../../middleware/license.middleware', () => ({
  requireLicense: (req: any, res: any, next: any) => next()
}));

const mockProductService = productService as jest.Mocked<typeof productService>;
const mockAuditService = AuditService as jest.Mocked<typeof AuditService>;

describe('ProductController API', () => {
  let app: any;

  beforeAll(() => {
    // We pass a fake context because db is mocked in setupTests.ts
    app = buildApp({ dbConnected: true, userDataPath: undefined });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return a list of products', async () => {
      // Setup the mock to return fake data
      mockProductService.getAllProducts.mockResolvedValue({
        data: [
          { id: 1, name: 'Test Product 1', categoryId: 1, costPrice: 1000, sellingPrice: 2000, isActive: true } as any
        ],
        meta: { totalRecords: 1, totalPages: 1, currentPage: 1, pageSize: 20 }
      });

      const response = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer faketoken123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Test Product 1');
      expect(mockProductService.getAllProducts).toHaveBeenCalledTimes(1);
    });

    it('should pass query parameters to the service', async () => {
      mockProductService.getAllProducts.mockResolvedValue({ data: [], meta: {} as any });

      await request(app)
        .get('/api/products?categoryId=2&search=test')
        .set('Authorization', 'Bearer faketoken123');

      expect(mockProductService.getAllProducts).toHaveBeenCalledWith({
        categoryId: 2,
        search: 'test'
      });
    });
  });

  describe('POST /api/products', () => {
    it('should create a product and log an audit event', async () => {
      const newProduct = {
        id: 5,
        name: 'New Item',
        categoryId: 1,
        costPrice: 500,
        sellingPrice: 1000,
      };

      mockProductService.createProduct.mockResolvedValue(newProduct as any);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer faketoken123')
        .send({
          name: 'New Item',
          categoryId: 1,
          costPrice: 500,
          sellingPrice: 1000
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(5);

      // Verify service was called with correct data
      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Item', costPrice: 500 }),
        1 // The user ID injected by our mocked auth middleware
      );

      // Verify audit log was created
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE_PRODUCT',
          module: 'PRODUCT',
          recordId: '5'
        })
      );
    });
    
    it('should return 400 if validation fails', async () => {
      // In this app, the route likely uses a zod validator middleware
      // If we send invalid data, it shouldn't even reach the controller logic
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer faketoken123')
        .send({
          // Missing required fields like name, categoryId
          costPrice: -100 // invalid negative price
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      // Ensure the service was never actually called
      expect(mockProductService.createProduct).not.toHaveBeenCalled();
    });
  });
});
