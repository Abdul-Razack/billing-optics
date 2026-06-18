"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./Sidebar";
import { BranchSelector } from "./BranchSelector";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, WifiOff, ChevronLeft } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isOnline = useNetworkStatus();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
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
            <MobileNav
              pathname={pathname}
              userRole={user?.role}
              onClose={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => router.back()}
          title="Go Back"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Go Back</span>
        </Button>

        <h2 className="text-lg font-medium text-foreground tracking-tight hidden sm:block">
          Welcome back
        </h2>
        <h2 className="text-lg font-bold text-primary tracking-tight sm:hidden">
          Optics ERP
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <BranchSelector />
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
