"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Filter, SlidersHorizontal } from "lucide-react";
import { ProductUrlState } from "@/hooks/useProductUrlState";
import { ApiCategory } from "@/services/category.service";
import { CustomField } from "@/types/product";

interface ProductFilterDrawerProps {
  state: ProductUrlState;
  updateState: (updates: Partial<ProductUrlState>) => void;
  categories: ApiCategory[];
  customFields: CustomField[];
}

export function ProductFilterDrawer({ state, updateState, categories, customFields }: ProductFilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filter Products
          </SheetTitle>
          <SheetDescription>
            Refine your product catalog using advanced filters.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium leading-none">Core Attributes</h4>
            
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={state.categoryId}
                onChange={(e) => updateState({ categoryId: e.target.value })}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={state.status}
                onChange={(e) => updateState({ status: e.target.value })}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stock Status</Label>
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={state.stockStatus}
                onChange={(e) => updateState({ stockStatus: e.target.value })}
              >
                <option value="all">All Stock Statuses</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium leading-none">Price Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Min Price ($)</Label>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="0.00" 
                  value={state.minPrice}
                  onChange={(e) => updateState({ minPrice: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Max Price ($)</Label>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="Any" 
                  value={state.maxPrice}
                  onChange={(e) => updateState({ maxPrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          {customFields.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="font-medium leading-none">Dynamic Attributes</h4>
              
              {customFields.map((field) => {
                const key = `custom_${field.id}`;
                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground capitalize">{field.name || field.id.replace(/_/g, ' ')}</Label>
                    {field.type === 'dropdown' && field.options ? (
                      <select 
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={state[key] || "all"}
                        onChange={(e) => updateState({ [key]: e.target.value })}
                      >
                        <option value="all">Any</option>
                        {field.options.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                       <select 
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={state[key] || "all"}
                        onChange={(e) => updateState({ [key]: e.target.value })}
                      >
                        <option value="all">Any</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <Input 
                        type="text" 
                        placeholder={`Filter by ${field.name}...`} 
                        value={state[key] || ""}
                        onChange={(e) => updateState({ [key]: e.target.value })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
