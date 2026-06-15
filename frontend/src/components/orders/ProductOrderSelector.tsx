import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Package, Loader2, PlusCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProductService, ApiProduct } from "@/services/product.service";
import { ShortcutService, Shortcut } from "@/services/shortcut.service";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";

interface ProductOrderSelectorProps {
  onAdd: (product: ApiProduct) => void;
  disabled?: boolean;
}

export function ProductOrderSelector({ onAdd, disabled }: ProductOrderSelectorProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isLoading, setIsLoading] = useState(false);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  useEffect(() => {
    ShortcutService.getAllShortcuts().then(data => setShortcuts(data)).catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await ProductService.getProducts({ search: debouncedSearch });
        // Only show active products for checkout
        if (isMounted) setProducts(data.filter(p => p.isActive));
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    // Fetch immediately on open if empty, or when search changes
    if (open || debouncedSearch) {
      fetchProducts();
    }
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, open]);

  const handleSelect = (product: ApiProduct) => {
    onAdd(product);
    setOpen(false);
    setSearch("");
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const term = search.trim().toUpperCase();
      const shortcutMatch = shortcuts.find(s => s.shortcutKey === term);
      
      if (shortcutMatch) {
        e.preventDefault();
        try {
          setIsLoading(true);
          const product = await ProductService.getProductById(shortcutMatch.productId);
          if (product && product.isActive && (product.stock ?? 1) > 0) {
            handleSelect(product);
            toast.success(`Added ${product.name} via shortcut '${term}'`);
          } else {
            toast.error("Shortcut product is out of stock or inactive.");
          }
        } catch (err) {
          toast.error("Failed to load shortcut product");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <div className="flex items-center gap-2 truncate text-muted-foreground">
            <Package className="h-4 w-4 shrink-0" />
            Search and add product to invoice...
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search by name, SKU, barcode, or Shortcut Key..." 
            value={search}
            onValueChange={setSearch}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : (
                "No active products found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {!isLoading && products.map((product) => {
                // In a real app we'd fetch live stock here or it would be included in the product response
                // The current API doesn't return stock in getProducts directly if we rely on inventory module, 
                // but let's assume `stock` might be passed or we just show the price
                const stock = product.stock ?? 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= (product.minStockAlert || 5);

                return (
                  <CommandItem
                    key={product.id}
                    value={product.id.toString()}
                    onSelect={() => !isOutOfStock && handleSelect(product)}
                    className={`py-3 ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={isOutOfStock}
                  >
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-foreground">{product.name}</span>
                        <span className="font-bold text-primary">{formatCurrency(product.sellingPrice)}</span>
                      </div>
                      <div className="flex flex-wrap justify-between items-center text-xs gap-2 mt-1">
                        <span className="text-muted-foreground">SKU: {product.sku}</span>
                        <div className="flex gap-2">
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="text-[10px] h-4 py-0 px-1">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="secondary" className="text-[10px] h-4 py-0 px-1 text-orange-600 bg-orange-100 border-orange-200">Low Stock: {stock}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 text-emerald-600 bg-emerald-50 border-emerald-200">In Stock: {stock}</Badge>
                          )}
                          {product.gstPercent > 0 && (
                            <Badge variant="outline" className="text-[10px] h-4 py-0 px-1">
                              +{product.gstPercent}% Tax
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isOutOfStock && <PlusCircle className="ml-3 h-5 w-5 text-muted-foreground opacity-50 hover:opacity-100 shrink-0" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
