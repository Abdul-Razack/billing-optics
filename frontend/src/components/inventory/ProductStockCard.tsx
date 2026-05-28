import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductStockCardProps {
  product: Product;
  className?: string;
}

export function ProductStockCard({ product, className }: ProductStockCardProps) {
  const isLowStock = product.currentStock <= product.minStockAlert;
  const isOutOfStock = product.currentStock === 0;

  return (
    <div className={cn("bg-card rounded-lg border border-border shadow-sm p-4", className)}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-sm text-foreground line-clamp-1" title={product.name}>
            {product.name}
          </h4>
          <p className="text-xs text-muted-foreground">{product.sku}</p>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded text-xs font-medium shrink-0 ml-2",
          isOutOfStock ? "bg-red-100 text-red-800" :
          isLowStock ? "bg-orange-100 text-orange-800" :
          "bg-green-100 text-green-800"
        )}>
          {product.currentStock} qty
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 mt-4 overflow-hidden">
        <div 
          className={cn(
            "h-1.5 rounded-full",
            isOutOfStock ? "bg-red-500 w-0" :
            isLowStock ? "bg-orange-500" :
            "bg-green-500"
          )}
          style={{ width: `${Math.min(100, Math.max(0, (product.currentStock / (product.minStockAlert * 3)) * 100))}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Min: {product.minStockAlert}</span>
        <span>Ideal: {product.minStockAlert * 3}</span>
      </div>
    </div>
  );
}
