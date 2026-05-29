import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export function InventoryStatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  isLoading
}: InventoryStatCardProps) {
  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium"><div className="h-4 w-24 bg-muted rounded animate-pulse"></div></CardTitle>
          <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold"><div className="h-8 w-16 bg-muted rounded animate-pulse mt-1"></div></div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">
              <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center mt-1 space-x-2">
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              )}>
                {trend.isPositive ? "+" : "-"}{trend.value}
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
