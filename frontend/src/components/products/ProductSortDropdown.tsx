"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp } from "lucide-react";

export type ProductSortOption = 
  | "newest" 
  | "oldest" 
  | "name-asc" 
  | "name-desc" 
  | "price-asc" 
  | "price-desc" 
  | "stock-asc" 
  | "stock-desc";

interface ProductSortDropdownProps {
  value: ProductSortOption;
  onChange: (value: ProductSortOption) => void;
}

export function ProductSortDropdown({ value, onChange }: ProductSortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(val) => onChange(val as ProductSortOption)}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="price-asc">Price (Low to High)</SelectItem>
          <SelectItem value="price-desc">Price (High to Low)</SelectItem>
          <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
          <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
