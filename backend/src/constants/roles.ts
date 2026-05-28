export const ROLES = {
  ADMIN: 'ADMIN',
  OPTOMETRIST: 'OPTOMETRIST', // Used as Manager
  CASHIER: 'CASHIER',
} as const;

export type UserRole = keyof typeof ROLES;
export default ROLES;
