import { processCheckout } from '../checkout.engine';
import { db } from '../../config/db';
import { AppError } from '../../utils/errors';

jest.mock('../../config/db', () => ({
  db: {
    transaction: jest.fn()
  }
}));

jest.mock('../../repositories/inventory.repository', () => ({
  InventoryRepository: jest.fn().mockImplementation(() => ({
    getCurrentStock: jest.fn().mockResolvedValue(100),
    logTransaction: jest.fn().mockResolvedValue(true)
  }))
}));

describe('checkout.engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process a valid checkout', async () => {
    const txMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([{ id: 1, sellingPrice: 100, name: 'Product A' }]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 99 }]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };

    (db.transaction as jest.Mock).mockImplementation(async (cb) => {
      return await cb(txMock);
    });

    const result = await processCheckout({
      createdBy: 1,
      items: [{ productId: 1, quantity: 2 }],
      payments: [{ method: 'CASH', amount: 200 }]
    });

    expect(result.success).toBe(true);
    expect(result.recordId).toBe(99);
    expect(txMock.select).toHaveBeenCalled();
  });

  it('should throw an error if product is not found', async () => {
    const txMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]),
    };

    (db.transaction as jest.Mock).mockImplementation(async (cb) => {
      return await cb(txMock);
    });

    await expect(processCheckout({
      createdBy: 1,
      items: [{ productId: 999, quantity: 1 }]
    })).rejects.toThrow(AppError);
  });
});
