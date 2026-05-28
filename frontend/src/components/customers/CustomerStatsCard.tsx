import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomerStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function CustomerStatsCard({ title, value, description, icon, className }: CustomerStatsCardProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border p-6 shadow-sm flex flex-col", className)}>
      <div className="flex items-center justify-between space-x-2">
        <h3 className="text-sm font-medium text-muted-foreground tracking-tight">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
    </div>
  );
}
