import { Package, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StockSummaryProps {
  total: number;
  healthy: number;
  lowStock: number;
  outOfStock: number;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function StockSummary({ total, healthy, lowStock, outOfStock, activeFilter, onFilterChange }: StockSummaryProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-primary/10 text-primary rounded-full">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <h3 className="text-2xl font-bold">{total}</h3>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-green-500/10 text-green-600 rounded-full">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Healthy Stock</p>
              <h3 className="text-2xl font-bold">{healthy}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-full">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              <h3 className="text-2xl font-bold">{lowStock}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-destructive/10 text-destructive rounded-full">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <h3 className="text-2xl font-bold">{outOfStock}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground mr-2">Quick Filters:</span>
        <Button 
          variant={activeFilter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange("all")}
          className="rounded-full"
        >
          All
        </Button>
        <Button 
          variant={activeFilter === "LOW_STOCK" ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange("LOW_STOCK")}
          className="rounded-full"
        >
          Low Stock
        </Button>
        <Button 
          variant={activeFilter === "OUT_OF_STOCK" ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange("OUT_OF_STOCK")}
          className="rounded-full"
        >
          Out of Stock
        </Button>
      </div>
    </div>
  );
}
