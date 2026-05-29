"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductSelectorProps {
  onSelect: (product: Product) => void;
}

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3); // Only show top 3 to simulate a dropdown/modal restriction

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search products by name or SKU..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-11 text-base bg-background focus-visible:ring-primary shadow-sm"
        />
      </div>
      
      {searchTerm && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id} className="h-12">
                  <TableCell className="py-2">
                    <div className="font-medium text-sm leading-tight">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.sku}</div>
                  </TableCell>
                  <TableCell className="py-2">${product.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className="py-2">
                    <span className={product.currentStock > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                      {product.currentStock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => {
                        onSelect(product);
                        setSearchTerm("");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-4">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
