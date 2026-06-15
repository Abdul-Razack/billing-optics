"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, SlidersHorizontal, RefreshCcw } from "lucide-react";
import { ProductUrlState } from "@/hooks/useProductUrlState";
import { ApiCategory } from "@/services/category.service";
import { CustomField } from "@/types/custom-field";

interface ProductFilterDrawerProps {
  state: ProductUrlState;
  updateState: (updates: Partial<ProductUrlState>) => void;
  clearFilters: () => void;
  categories: ApiCategory[];
  customFields: CustomField[];
}

export function ProductFilterDrawer({ state, updateState, clearFilters, categories, customFields }: ProductFilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Filter Products
          </SheetTitle>
          <SheetDescription>
            Refine your product catalog using advanced filters.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 px-4 space-y-6 flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            <h4 className="font-medium leading-none text-sm border-b pb-2">Core Attributes</h4>
            
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={state.categoryId} onValueChange={(val) => updateState({ categoryId: val || "all" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={state.status} onValueChange={(val) => updateState({ status: val || "all" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stock Status</Label>
              <Select value={state.stockStatus} onValueChange={(val) => updateState({ stockStatus: val || "all" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Stock Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Statuses</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium leading-none text-sm border-b pb-2">Price Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Min Price ($)</Label>
                <Input 
                  type="NUMBER" 
                  min="0"
                  placeholder="0.00" 
                  value={state.minPrice}
                  onChange={(e) => updateState({ minPrice: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Max Price ($)</Label>
                <Input 
                  type="NUMBER" 
                  min="0"
                  placeholder="Any" 
                  value={state.maxPrice}
                  onChange={(e) => updateState({ maxPrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          {customFields.length > 0 && (
            <div className="space-y-4 pt-2">
              <h4 className="font-medium leading-none text-sm border-b pb-2">Dynamic Attributes</h4>
              
              {customFields.map((field) => {
                const key = `custom_${field.id}`;
                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground capitalize">{field.name || field.id.replace(/_/g, ' ')}</Label>
                    {field.type === "DROPDOWN" && field.options ? (
                      <Select value={state[key] || "all"} onValueChange={(val) => updateState({ [key]: val })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          {field.options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "CHECKBOX" ? (
                      <Select value={state[key] || "all"} onValueChange={(val) => updateState({ [key]: val })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        type="TEXT" 
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

        <SheetFooter className="shrink-0 pt-4 border-t gap-2 sm:gap-0">
          <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <SheetClose render={<Button className="w-full sm:w-auto">Show Results</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
