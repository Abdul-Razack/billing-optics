import { authenticate } from '../auth.middleware';
import { db } from '../../config/db';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import env from '../../config/env';

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should throw Unauthorized if no auth header', async () => {
    await authenticate(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Authorization header with Bearer token is required',
    }));
  });

  it('should throw Unauthorized if token is invalid', async () => {
    req.headers = { authorization: 'Bearer invalid_token' };
    
    // jest.mock of jwt not strictly needed if we let it fail naturally
    // but we can ensure env.JWT_SECRET is set
    
    await authenticate(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid or expired token',
    }));
  });

  it('should authenticate a valid token and active user', async () => {
    const validToken = jwt.sign({ userId: 1 }, env.JWT_SECRET || 'secret');
    req.headers = { authorization: `Bearer ${validToken}` };

    // Mock the chained Drizzle query
    // The query is db.select().from().where().limit(1)
    // We mock the final chained method (limit) to resolve to our mock user array
    ((db as any).limit as jest.Mock).mockResolvedValueOnce([
      { id: 1, isActive: true, role: 'ADMIN' }
    ]);

    await authenticate(req as Request, res as Response, next);

    expect(req.user).toEqual({ id: 1, role: 'ADMIN' });
    expect(next).toHaveBeenCalledWith(); // Called with no error
  });

  it('should throw Forbidden if user is inactive', async () => {
    const validToken = jwt.sign({ userId: 2 }, env.JWT_SECRET || 'secret');
    req.headers = { authorization: `Bearer ${validToken}` };

    ((db as any).limit as jest.Mock).mockResolvedValueOnce([
      { id: 2, isActive: false, role: 'CASHIER' }
    ]);

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'User account is inactive',
    }));
  });

  it('should throw Unauthorized if user does not exist in db', async () => {
    const validToken = jwt.sign({ userId: 999 }, env.JWT_SECRET || 'secret');
    req.headers = { authorization: `Bearer ${validToken}` };

    ((db as any).limit as jest.Mock).mockResolvedValueOnce([]); // No user returned

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'User not found',
    }));
  });
});
