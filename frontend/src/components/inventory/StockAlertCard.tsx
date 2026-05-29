import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockAlertCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  colorClass?: string;
}

export function StockAlertCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  colorClass
}: StockAlertCardProps) {
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
        <Icon className={cn("h-4 w-4", colorClass || "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <div className="flex items-center mt-1 space-x-2">
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
