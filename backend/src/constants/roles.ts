export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  OPTOMETRIST: 'OPTOMETRIST',
} as const;

export type UserRole = keyof typeof ROLES;
export default ROLES;
