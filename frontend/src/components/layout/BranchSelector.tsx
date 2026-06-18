"use client";

import { useEffect, useState } from "react";
import { useBranch } from "@/contexts/BranchContext";
import { locationService } from "@/services/location.service";
import { ApiLocation } from "@/types/location";
import { Building2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function BranchSelector() {
  const { activeBranch, setActiveBranch } = useBranch();
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      try {
        const response = await locationService.getLocations({ isActive: true });
        if (!cancelled) {
          const data = response?.data?.data ?? [];
          setLocations(data);

          // Auto-select the first branch if none is selected yet
          if (data.length > 0 && !activeBranch) {
            setActiveBranch(data[0]);
          }
        }
      } catch {
        // Silently ignore — the selector simply won't render if unavailable
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadLocations();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only render when there are 2+ locations (multi-branch is meaningless with 1 or 0)
  if (isLoading || locations.length < 2) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex gap-2 max-w-[180px]">
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{activeBranch?.name ?? "Select Branch"}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {locations.map((loc) => (
          <DropdownMenuItem
            key={loc.id}
            onClick={() => setActiveBranch(loc)}
            className={
              activeBranch?.id === loc.id
                ? "bg-primary/10 text-primary font-medium"
                : ""
            }
          >
            <div className="flex flex-col">
              <span>{loc.name}</span>
              <span className="text-xs text-muted-foreground">{loc.code}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
