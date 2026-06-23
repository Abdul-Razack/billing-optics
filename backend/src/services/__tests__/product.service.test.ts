import { ProductService } from '../product.service';
import { db } from '../../config/db';
import { products, inventoryLedger } from '../../db/schema';

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should insert a product into the database', async () => {
      const mockProduct = { id: 10, name: 'Rayban Test', categoryId: 1 };
      
      // We set up the mock so that returning() gives us the newly "inserted" product
      ((db as any).returning as jest.Mock).mockResolvedValueOnce([mockProduct]);

      const result = await productService.createProduct({
        name: 'Rayban Test',
        categoryId: 1,
        costPrice: 500,
        sellingPrice: 1000,
        initialStock: 0,
      }, 1);

      expect(db.insert).toHaveBeenCalledWith(products);
      expect(result).toEqual(mockProduct);
    });

    it('should create an inventory ledger entry if initialStock > 0', async () => {
      const mockProduct = { id: 11, name: 'Initial Stock Test', categoryId: 1 };
      
      // First returning is for the product
      ((db as any).returning as jest.Mock).mockResolvedValueOnce([mockProduct]);

      await productService.createProduct({
        name: 'Initial Stock Test',
        categoryId: 1,
        costPrice: 500,
        sellingPrice: 1000,
        initialStock: 50,
      }, 1);

      // Verify products insert
      expect(db.insert).toHaveBeenCalledWith(products);

      // Verify inventory ledger insert
      expect(db.insert).toHaveBeenCalledWith(inventoryLedger);
      expect((db as any).values).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 11,
          movementType: 'ADJUSTMENT',
          quantityChange: 50,
          createdBy: 1,
        })
      );
    });
  });
});
