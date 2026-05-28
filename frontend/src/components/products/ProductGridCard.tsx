"use client";

import { ApiProduct } from "@/services/product.service";
import { ApiCategory } from "@/services/category.service";
import { calculateStockStatus } from "@/lib/stock";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductActionsDropdown } from "./ProductActionsDropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Image as ImageIcon } from "lucide-react";

interface ProductGridCardProps {
  product: ApiProduct;
  category?: ApiCategory;
  onDelete?: (id: number) => void;
  onQuickStockUpdate?: (product: ApiProduct) => void;
  isSelected?: boolean;
  onToggleSelection?: (selected: boolean) => void;
}

export function ProductGridCard({ product, category, onDelete, onQuickStockUpdate, isSelected, onToggleSelection }: ProductGridCardProps) {
  const { currentStock, status: stockStatus } = calculateStockStatus(
    (product as any).currentStock, 
    product.minStockAlert
  );

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.sellingPrice);

  return (
    <div className={`group relative flex flex-col rounded-xl border ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'} bg-card overflow-hidden shadow-sm hover:shadow-md transition-all ${stockStatus === 'OUT_OF_STOCK' ? 'opacity-80' : ''}`}>
      <div className="relative h-40 bg-muted/30 flex items-center justify-center border-b border-border">
        {onToggleSelection && (
          <div className={`absolute top-3 left-3 z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
            <Checkbox 
              checked={isSelected}
              onCheckedChange={(checked) => onToggleSelection(!!checked)}
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>
        )}
        
        {/* Placeholder for Image */}
        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
        <div className="absolute top-3 right-3">
          <ProductActionsDropdown 
            product={product} 
            onDelete={onDelete} 
            onQuickStockUpdate={onQuickStockUpdate} 
          />
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-semibold text-lg line-clamp-1 flex-1">{product.name}</h3>
          <span className="font-bold whitespace-nowrap">{formattedPrice}</span>
        </div>
        
        <div className="text-xs text-muted-foreground mb-3 flex items-center justify-between">
          <span>{product.sku}</span>
          <span>{category?.name || "Uncategorized"}</span>
        </div>
        
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{currentStock}</span>
            <ProductStatusBadge type="stock" status={stockStatus} />
          </div>
          <ProductStatusBadge type="active" isActive={product.isActive} />
        </div>
      </div>
    </div>
  );
}
