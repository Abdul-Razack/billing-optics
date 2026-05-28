import { ArrowRight, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityPreviewCardProps {
  currentStock: number;
  newStock: number;
  adjustmentType: string;
}

export function QuantityPreviewCard({ currentStock, newStock, adjustmentType }: QuantityPreviewCardProps) {
  const difference = newStock - currentStock;
  const isPositive = difference > 0;
  const isNegative = difference < 0;
  const isUnchanged = difference === 0;

  return (
    <div className="bg-muted/50 rounded-lg p-4 border border-border flex items-center justify-between">
      <div className="flex flex-col items-center">
        <span className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Current</span>
        <div className="flex items-center space-x-2">
          <Box className="h-4 w-4 text-muted-foreground" />
          <span className="text-xl font-bold">{currentStock}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <ArrowRight className="h-5 w-5" />
        </div>
        {!isUnchanged && (
          <span className={cn(
            "text-xs font-bold mt-1",
            isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            {isPositive ? "+" : ""}{difference}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xs text-muted-foreground mb-1 uppercase font-semibold">New Stock</span>
        <div className="flex items-center space-x-2">
          <Box className={cn(
            "h-4 w-4",
            isUnchanged ? "text-muted-foreground" : isPositive ? "text-emerald-500" : "text-rose-500"
          )} />
          <span className={cn(
            "text-xl font-bold",
            isUnchanged ? "text-foreground" : isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            {isNaN(newStock) ? currentStock : newStock}
          </span>
        </div>
      </div>
    </div>
  );
}
