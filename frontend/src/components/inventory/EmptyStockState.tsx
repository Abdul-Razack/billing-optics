import { Box } from "lucide-react";

interface EmptyStockStateProps {
  searchQuery?: string;
  hasFilters?: boolean;
}

export function EmptyStockState({ searchQuery, hasFilters }: EmptyStockStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Box className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No stock records found
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {searchQuery 
          ? `We couldn't find any stock records matching "${searchQuery}".` 
          : hasFilters 
            ? "No stock records match your current filters. Try clearing them."
            : "Your inventory is currently empty. Add products to track stock."}
      </p>
    </div>
  );
}
