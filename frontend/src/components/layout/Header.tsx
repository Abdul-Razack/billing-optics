"use client";

import { UserMenu } from "./UserMenu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./Sidebar";
import { useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Badge } from "@/components/ui/badge";
import { WifiOff } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isOnline = useNetworkStatus();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="h-16 flex items-center px-6 border-b border-border">
              <span className="font-bold text-lg text-primary tracking-tight">Optics ERP</span>
            </div>
            <nav className="py-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-medium text-foreground tracking-tight hidden sm:block">
          Welcome back
        </h2>
        {/* Mobile title fallback */}
        <h2 className="text-lg font-bold text-primary tracking-tight sm:hidden">
          Optics ERP
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        {!isOnline && (
          <Badge variant="destructive" className="hidden sm:flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            Offline Mode
          </Badge>
        )}
        <UserMenu />
      </div>
    </header>
  );
}
