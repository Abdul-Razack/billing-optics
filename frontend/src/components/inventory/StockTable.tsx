import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiProduct } from "@/services/product.service";
import { ApiCategory } from "@/services/category.service";
import { StockStatusBadge, StockStatus } from "@/components/products/StockStatusBadge";
import { calculateStockStatus } from "@/lib/stock";
import { Checkbox } from "@/components/ui/checkbox";
import { StockActionsDropdown } from "./StockActionsDropdown";
import { EmptyStockState } from "./EmptyStockState";

interface StockTableProps {
  products: ApiProduct[];
  categories: ApiCategory[];
  isLoading: boolean;
  searchQuery?: string;
  onAdjustStock: (product: ApiProduct) => void;
  selectedIds?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (id: number, checked: boolean) => void;
}

export function StockTable({
  products,
  categories,
  isLoading,
  searchQuery,
  onAdjustStock,
  selectedIds = new Set(),
  onSelectAll,
  onSelectRow
}: StockTableProps) {
  
  const isAllSelected = products.length > 0 && products.every(p => selectedIds.has(p.id));
  const isSomeSelected = products.some(p => selectedIds.has(p.id)) && !isAllSelected;

  
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-4"></TableHead>
              <TableHead>Product Info</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell className="px-4"><div className="h-4 w-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" /><div className="h-3 bg-muted rounded animate-pulse w-1/2" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                <TableCell className="text-right"><div className="h-4 bg-muted rounded animate-pulse w-12 ml-auto" /></TableCell>
                <TableCell className="text-right"><div className="h-4 bg-muted rounded animate-pulse w-12 ml-auto" /></TableCell>
                <TableCell><div className="h-6 bg-muted rounded-full animate-pulse w-20" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                <TableCell className="text-right"><div className="h-8 bg-muted rounded animate-pulse w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border bg-card">
        <EmptyStockState searchQuery={searchQuery} hasFilters={false} />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12 px-4">
              {onSelectAll && (
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={(checked) => onSelectAll(checked === true)}
                  aria-label="Select all"
                />
              )}
            </TableHead>
            <TableHead className="w-[300px]">Product Info</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead className="text-right text-muted-foreground">Reserved</TableHead>
            <TableHead className="text-right font-medium">Available</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const currentStock = (product as any).currentStock ?? 0;
            const reservedStock = 0; // Simulated for now since API doesn't provide it
            const availableStock = currentStock - reservedStock;
            
            const { status } = calculateStockStatus(currentStock, product.minStockAlert);
            const category = categories.find(c => c.id === product.categoryId);
            
            let dateStr = "Unknown";
            const dateObj = new Date(product.updatedAt || product.createdAt || 0);
            if (!isNaN(dateObj.getTime())) {
              dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            }

            return (
              <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="px-4">
                  {onSelectRow && (
                    <Checkbox 
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={(checked) => onSelectRow(product.id, checked === true)}
                      aria-label={`Select ${product.name}`}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{product.name}</span>
                    <span className="text-xs text-muted-foreground">{product.sku}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {category ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                      {category.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {currentStock}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {reservedStock}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {availableStock}
                </TableCell>
                <TableCell>
                  <StockStatusBadge status={status as StockStatus} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dateStr}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <StockActionsDropdown 
                    product={product} 
                    onAdjustStock={onAdjustStock}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
