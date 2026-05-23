// Starter constants for the Optics Shop Billing & Management System
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  OPTOMETRIST: 'OPTOMETRIST',
} as const;

export type UserRole = keyof typeof ROLES;

export const GST_RATES = {
  EXEMPT: 0,
  FIVE_PERCENT: 5,
  TWELVE_PERCENT: 12,
  EIGHTEEN_PERCENT: 18,
  TWENTY_EIGHT_PERCENT: 28,
} as const;
