export type UserRole = "ADMIN" | "CASHIER" | "OPTOMETRIST";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  phone?: string;
  permissions?: string[]; // E.g., ['manage_users', 'view_reports', 'create_invoices']
}
