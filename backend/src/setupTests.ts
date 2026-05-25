// Mock the database globally

const dbMock = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue([]),
};

jest.mock('./config/db', () => ({
  db: dbMock,
  __esModule: true,
  default: dbMock,
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  }
}));
