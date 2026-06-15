import { Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiProduct } from "@/services/product.service";

export interface InvoiceLineItem {
  product: ApiProduct;
  quantity: number;
}

interface InvoiceLineItemsProps {
  items: InvoiceLineItem[];
  onChangeQuantity: (productId: number, newQuantity: number) => void;
  onRemove: (productId: number) => void;
  disabled?: boolean;
}

export function InvoiceLineItems({ items, onChangeQuantity, onRemove, disabled }: InvoiceLineItemsProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed rounded-md bg-muted/20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
        <h3 className="text-sm font-medium text-foreground">No Items Selected</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Search and add products from above to build this invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="grid grid-cols-12 gap-2 bg-muted/50 p-3 text-xs font-medium text-muted-foreground border-b hidden sm:grid">
        <div className="col-span-5">Product Details</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-3 text-center">Qty</div>
        <div className="col-span-2 text-right pr-2">Total</div>
      </div>
      <div className="divide-y">
        {items.map((item) => {
          const { product, quantity } = item;
          const lineTotal = product.sellingPrice * quantity;

          return (
            <div key={product.id} className="p-3 sm:p-0 flex flex-col sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center hover:bg-muted/30 transition-colors">
              {/* Mobile: Product Name & Delete */}
              <div className="flex justify-between items-start sm:hidden mb-2">
                <div className="font-medium text-sm">{product.name}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                  onClick={() => onRemove(product.id)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Desktop: Details */}
              <div className="sm:col-span-5 sm:p-3 sm:border-r border-transparent flex justify-between items-center hidden sm:flex">
                <div className="flex flex-col truncate pr-2">
                  <span className="font-medium text-sm truncate">{product.name}</span>
                  <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                </div>
              </div>

              {/* Unit Price */}
              <div className="flex justify-between items-center sm:block sm:col-span-2 sm:text-right sm:p-3 text-sm text-muted-foreground mb-2 sm:mb-0">
                <span className="sm:hidden text-xs">Unit Price:</span>
                {formatCurrency(product.sellingPrice)}
              </div>

              {/* Quantity */}
              <div className="flex justify-between items-center sm:justify-center sm:col-span-3 sm:p-3 mb-2 sm:mb-0">
                <span className="sm:hidden text-xs text-muted-foreground">Quantity:</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    disabled={disabled}
                    onClick={() => {
                      if (quantity <= 1) {
                        onRemove(product.id);
                      } else {
                        onChangeQuantity(product.id, quantity - 1);
                      }
                    }}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="NUMBER"
                    value={quantity}
                    className="h-7 w-12 text-center text-sm p-1 hide-arrows"
                    min={1}
                    disabled={disabled}
                    onChange={(e) => {
                      if (e.target.value === "") return; // Allow intermediate empty state during typing
                      const val = parseInt(e.target.value);
                      if (val === 0) {
                        onRemove(product.id);
                      } else if (!isNaN(val) && val > 0) {
                        onChangeQuantity(product.id, val);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    disabled={disabled}
                    onClick={() => onChangeQuantity(product.id, quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Line Total & Desktop Delete */}
              <div className="flex justify-between items-center sm:col-span-2 sm:justify-end sm:p-3 font-medium text-foreground">
                <span className="sm:hidden text-xs text-muted-foreground">Line Total:</span>
                <div className="flex items-center gap-2">
                  {formatCurrency(lineTotal)}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hidden sm:flex ml-1"
                    onClick={() => onRemove(product.id)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
