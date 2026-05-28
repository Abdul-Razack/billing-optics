import { Button } from "@/components/ui/button";
import { PackagePlus, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkStockToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAdjust: () => void;
  onBulkExport: () => void;
}

export function BulkStockToolbar({
  selectedCount,
  onClearSelection,
  onBulkAdjust,
  onBulkExport
}: BulkStockToolbarProps) {
  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
      "transition-all duration-300 ease-in-out",
      selectedCount > 0 ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"
    )}>
      <div className="bg-primary text-primary-foreground shadow-lg rounded-full px-6 py-3 flex items-center space-x-6 border border-primary/20 backdrop-blur-md">
        <div className="flex items-center space-x-2 border-r border-primary-foreground/20 pr-4">
          <span className="bg-primary-foreground text-primary text-xs font-bold px-2 py-0.5 rounded-full">
            {selectedCount}
          </span>
          <span className="font-medium text-sm">Selected</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={onBulkAdjust}
          >
            <PackagePlus className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={onBulkExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="pl-4 border-l border-primary-foreground/20">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            onClick={onClearSelection}
            title="Clear Selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
