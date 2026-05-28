import { User } from "@/types/user";

export const MOCK_USERS: User[] = [
  {
    id: "user_1",
    name: "Admin User",
    email: "admin@opticserp.com",
    role: "ADMIN",
    status: "ACTIVE",
    lastLogin: "2023-11-10T08:30:00Z",
    createdAt: "2023-01-15T10:00:00Z",
    phone: "555-0100",
    permissions: ["manage_users", "view_reports", "manage_settings", "manage_inventory", "create_invoices"]
  },
  {
    id: "user_2",
    name: "John Cashier",
    email: "john@opticserp.com",
    role: "CASHIER",
    status: "ACTIVE",
    lastLogin: "2023-11-10T09:15:00Z",
    createdAt: "2023-03-22T09:30:00Z",
    phone: "555-0101",
    permissions: ["create_invoices", "view_customers"]
  },
  {
    id: "user_3",
    name: "Dr. Smith",
    email: "smith@opticserp.com",
    role: "OPTOMETRIST",
    status: "ACTIVE",
    lastLogin: "2023-11-09T14:45:00Z",
    createdAt: "2023-02-10T11:20:00Z",
    phone: "555-0102",
    permissions: ["create_prescriptions", "view_customers", "view_inventory"]
  },
  {
    id: "user_4",
    name: "Inactive User",
    email: "former@opticserp.com",
    role: "CASHIER",
    status: "INACTIVE",
    createdAt: "2023-01-20T10:00:00Z",
    phone: "555-0103"
  }
];
