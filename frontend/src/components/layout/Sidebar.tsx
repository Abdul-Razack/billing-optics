"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Boxes, 
  Stethoscope, 
  CreditCard, 
  BarChart3, 
  Settings, 
  UserCog, 
  FormInput 
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  { name: "Sales / Invoices", href: "/invoices", icon: FileText, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  { name: "Customers", href: "/customers", icon: Users, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  { name: "Products", href: "/products", icon: Package, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  { name: "Inventory", href: "/inventory", icon: Boxes, roles: ["ADMIN", "OPTOMETRIST"] },
  { name: "Prescriptions", href: "/prescriptions", icon: Stethoscope, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] }, // Note: cashier can view but not create
  { name: "Payments", href: "/payments", icon: CreditCard, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "OPTOMETRIST"] },
  { name: "Users", href: "/users", icon: UserCog, roles: ["ADMIN"] },
  { name: "Custom Fields", href: "/custom-fields", icon: FormInput, roles: ["ADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-56 bg-card border-r border-border min-h-screen flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center px-5 border-b border-border">
        <span className="font-bold text-lg text-primary tracking-tight">Optics ERP</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter(item => !user || item.roles.includes(user.role)).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
