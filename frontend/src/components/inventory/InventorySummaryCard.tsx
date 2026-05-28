import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InventorySummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function InventorySummaryCard({ title, value, description, icon, trend, className }: InventorySummaryCardProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border p-6 shadow-sm flex flex-col", className)}>
      <div className="flex items-center justify-between space-x-2">
        <h3 className="text-sm font-medium text-muted-foreground tracking-tight">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {description && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {trend && (
              <span className={trend.isPositive ? "text-green-600" : "text-destructive"}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
            )}
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
