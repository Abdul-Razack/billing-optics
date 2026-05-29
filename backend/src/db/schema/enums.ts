import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'CASHIER', 'OPTOMETRIST']);
export const paymentMethodEnum = pgEnum('payment_method', ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']);
export const movementTypeEnum = pgEnum('movement_type', ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT']);

export const paymentStatusEnum = pgEnum('payment_status', ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']);
export const referenceTypeEnum = pgEnum('reference_type', ['INVOICE', 'PURCHASE', 'RETURN', 'ADJUSTMENT']);
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['PENDING', 'READY', 'DELIVERED']);
