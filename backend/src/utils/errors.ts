export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InsufficientStockError extends AppError {
  constructor(message: string = 'Insufficient stock for one or more products') {
    super(400, message);
  }
}

export class IdempotencyConflictError extends AppError {
  constructor(message: string = 'Duplicate request detected') {
    super(409, message);
  }
}

export class InvalidProductError extends AppError {
  constructor(message: string = 'Invalid or inactive product requested') {
    super(400, message);
  }
}

export class BillingConflictError extends AppError {
  constructor(message: string = 'A concurrent billing conflict occurred') {
    super(409, message);
  }
}
