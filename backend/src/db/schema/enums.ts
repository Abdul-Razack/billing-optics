import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'CASHIER', 'OPTOMETRIST']);
export const paymentMethodEnum = pgEnum('payment_method', ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']);
export const movementTypeEnum = pgEnum('movement_type', ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN', 'AUDIT_ADJUSTMENT']);

export const paymentStatusEnum = pgEnum('payment_status', ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']);
export const referenceTypeEnum = pgEnum('reference_type', ['INVOICE', 'PURCHASE', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'AUDIT']);
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['PENDING', 'READY', 'DELIVERED']);
export const labJobStatusEnum = pgEnum('lab_job_status', ['PENDING', 'SENT_TO_LAB', 'PROCESSING', 'RECEIVED', 'READY', 'DELIVERED']);

export const offerTypeEnum = pgEnum('offer_type', ['PERCENTAGE', 'FLAT_AMOUNT']);

export const documentTypeEnum = pgEnum('document_type', ['INVOICE', 'CHALLAN']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['DRAFT', 'PENDING_CONFIRMATION', 'COMPLETED', 'CANCELLED']);
export const barcodeStatusEnum = pgEnum('barcode_status', ['PENDING_PRINT', 'ACTIVE', 'SOLD', 'RETURNED']);
export const adjustmentTypeEnum = pgEnum('adjustment_type', ['FREIGHT', 'DISCOUNT', 'REBATE', 'FITTING_CHARGE']);
export const transferStatusEnum = pgEnum('transfer_status', ['DRAFT', 'IN_TRANSIT', 'RECEIVED', 'PARTIALLY_RECEIVED', 'CANCELLED']);
export const auditStatusEnum = pgEnum('audit_status', ['IN_PROGRESS', 'RECONCILED', 'CANCELLED']);
