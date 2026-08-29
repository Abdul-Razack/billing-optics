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
  FormInput,
  ShoppingCart,
  Gift,
  ClipboardList,
  ChevronDown,
  Building2,
  FlaskConical,
  PlusCircle,
  ListOrdered,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Type definitions ──────────────────────────────────────────────────────────

interface NavChild {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  children?: NavChild[];
}

// ─── Navigation structure ──────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  {
    name: "Sales",
    href: "/orders",
    icon: FileText,
    roles: ["ADMIN", "OPTOMETRIST", "CASHIER"],
    children: [
      { name: "New Invoice",    href: "/orders/create",      icon: PlusCircle,   roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
      { name: "Order History",  href: "/orders",             icon: ListOrdered,  roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
      { name: "Invoices",       href: "/invoices",           icon: FileText,     roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
      { name: "Bulk Invoice",   href: "/sales/bulk-invoice", icon: Layers,       roles: ["ADMIN"] },
    ],
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
    roles: ["ADMIN", "OPTOMETRIST", "CASHIER"],
    children: [
      { name: "All Customers",    href: "/customers",            icon: Users,         roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
      { name: "Marketing Hub",    href: "/customers/marketing",  icon: Gift,          roles: ["ADMIN", "OPTOMETRIST"] },
      { name: "Visitors Log",     href: "/reports/visitors",     icon: ClipboardList, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
      { name: "Offers & Coupons", href: "/customers/offers",     icon: Package,       roles: ["ADMIN"] },
      { name: "Referral Network", href: "/customers/referrals",  icon: Users,         roles: ["ADMIN", "OPTOMETRIST"] },
      { name: "Loyalty Program",  href: "/customers/loyalty",   icon: Gift,          roles: ["ADMIN", "OPTOMETRIST"] },
    ],
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
    roles: ["ADMIN", "OPTOMETRIST", "CASHIER"],
    children: [
      { name: "All Products", href: "/products", icon: Package, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
      { name: "Categories", href: "/categories", icon: ListOrdered, roles: ["ADMIN", "OPTOMETRIST"] },
    ],
  },
  { name: "Purchases",     href: "/purchases",     icon: ShoppingCart, roles: ["ADMIN", "OPTOMETRIST"] },
  { name: "Inventory",     href: "/inventory",     icon: Boxes,        roles: ["ADMIN", "OPTOMETRIST"] },
  { name: "Prescriptions", href: "/prescriptions", icon: Stethoscope,  roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  { name: "Lab Jobs",      href: "/lab-jobs",      icon: FlaskConical, roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  { name: "Vendors",       href: "/vendors",       icon: Building2,    roles: ["ADMIN", "OPTOMETRIST"] },
  { name: "Payments",      href: "/payments",      icon: CreditCard,   roles: ["ADMIN", "OPTOMETRIST", "CASHIER"] },
  { name: "Reports",       href: "/reports",       icon: BarChart3,    roles: ["ADMIN", "OPTOMETRIST"] },
  { name: "Users",         href: "/users",         icon: UserCog,      roles: ["ADMIN"] },
  { name: "Settings",      href: "/settings",      icon: Settings,     roles: ["ADMIN"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isGroupActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  return item.children?.some(
    (c) => pathname === c.href || pathname.startsWith(`${c.href}/`)
  ) ?? false;
}

// ─── Collapsible group component ──────────────────────────────────────────────

function NavGroup({
  item,
  pathname,
  userRole,
  onChildClick,
}: {
  item: NavItem;
  pathname: string;
  userRole: string | undefined;
  onChildClick?: () => void;
}) {
  const groupActive = isGroupActive(item, pathname);
  const [open, setOpen] = useState(groupActive);

  const visibleChildren = item.children?.filter(
    (c) => !userRole || c.roles.includes(userRole)
  );

  if (!visibleChildren || visibleChildren.length === 0) {
    // Render as plain link if no accessible children
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        href={item.href}
        onClick={onChildClick}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
        {item.name}
      </Link>
    );
  }

  return (
    <div className="space-y-0.5">
      {/* Parent trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
          groupActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span className="flex items-center">
          <item.icon
            className={cn(
              "mr-3 h-5 w-5 shrink-0",
              groupActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          {item.name}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
            groupActive ? "text-primary" : "text-muted-foreground"
          )}
        />
      </button>

      {/* Children */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="ml-3 pl-4 border-l-2 border-border space-y-0.5 py-1">
          {visibleChildren.map((child) => {
            // A child is active if it matches the pathname…
            const selfMatch =
              pathname === child.href ||
              pathname.startsWith(`${child.href}/`);
            // …but NOT if a sibling is a more specific (longer) match,
            // which avoids /customers lighting up when /customers/marketing is active.
            const siblingIsMoreSpecific = visibleChildren.some(
              (s) =>
                s.href !== child.href &&
                (pathname === s.href || pathname.startsWith(`${s.href}/`)) &&
                s.href.length > child.href.length
            );
            const childActive = selfMatch && !siblingIsMoreSpecific;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onChildClick}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-md transition-colors",
                  childActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <child.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    childActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {child.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-56 bg-card border-r border-border h-full flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
        <span className="font-bold text-lg text-primary tracking-tight">Optics ERP</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto flex flex-col">
        <div className="space-y-0.5">
          {NAV_ITEMS.filter((item) => item.name !== "Settings" && (!user || item.roles.includes(user.role))).map((item) => {
            if (item.children) {
              return (
                <NavGroup
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  userRole={user?.role}
                />
              );
            }

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                <item.icon
                  className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-4 space-y-0.5">
          {NAV_ITEMS.filter((item) => item.name === "Settings" && (!user || item.roles.includes(user.role))).map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                <item.icon
                  className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

// ─── Mobile nav helper (used by Header sheet) ────────────────────────────────

export function MobileNav({
  pathname,
  userRole,
  onClose,
}: {
  pathname: string;
  userRole: string | undefined;
  onClose: () => void;
}) {
  return (
    <nav className="py-4 px-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {NAV_ITEMS.filter((item) => !userRole || item.roles.includes(userRole)).map((item) => {
        if (item.children) {
          return (
            <NavGroup
              key={item.name}
              item={item}
              pathname={pathname}
              userRole={userRole}
              onChildClick={onClose}
            />
          );
        }

        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon
              className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
