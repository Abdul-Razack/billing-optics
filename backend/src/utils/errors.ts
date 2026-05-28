export class AppError extends Error {
  constructor(
    public statusCode: number, 
    message: string, 
    public details?: any[]
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any[]) {
    super(401, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any[]) {
    super(403, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any[]) {
    super(404, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any[]) {
    super(409, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any[]) {
    super(400, message, details);
  }
}

// Keeping specific domain errors for backward compatibility
export class InsufficientStockError extends AppError {
  constructor(message: string = 'Insufficient stock for one or more products') {
    super(400, message);
  }
}

export class IdempotencyConflictError extends ConflictError {
  constructor(message: string = 'Duplicate request detected') {
    super(message);
  }
}

export class InvalidProductError extends AppError {
  constructor(message: string = 'Invalid or inactive product requested') {
    super(400, message);
  }
}

export class BillingConflictError extends ConflictError {
  constructor(message: string = 'A concurrent billing conflict occurred') {
    super(message);
  }
}
