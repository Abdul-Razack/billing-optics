"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Purchase Bills", href: "/purchases" },
  { name: "New Purchase", href: "/purchases/new" },
  { name: "Barcodes", href: "/purchases/barcodes" },
  { name: "Exceptions", href: "/purchases/exceptions" },
];

export default function PurchasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <nav className="flex space-x-4 lg:space-x-6" aria-label="Purchases Navigation">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === tab.href || pathname.startsWith(tab.href + '/') 
                    ? "text-primary border-b-2 border-primary pb-[1.2rem]"
                    : "text-muted-foreground"
                )}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex-1 p-4 md:p-6 lg:p-8 pt-0">
        {children}
      </div>
    </div>
  );
}
