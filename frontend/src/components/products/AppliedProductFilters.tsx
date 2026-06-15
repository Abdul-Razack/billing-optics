"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ProductUrlState } from "@/hooks/useProductUrlState";
import { ApiCategory } from "@/services/category.service";
import { CustomField } from "@/types/custom-field";

interface AppliedProductFiltersProps {
  state: ProductUrlState;
  updateState: (updates: Partial<ProductUrlState>) => void;
  clearFilters: () => void;
  categories: ApiCategory[];
  customFields: CustomField[];
}

export function AppliedProductFilters({ state, updateState, clearFilters, categories, customFields }: AppliedProductFiltersProps) {
  const activeFilters = [];

  if (state.categoryId !== "all") {
    const cat = categories.find(c => c.id.toString() === state.categoryId);
    activeFilters.push({
      key: "categoryId",
      label: `Category: ${cat?.name || state.categoryId}`
    });
  }

  if (state.status !== "all") {
    activeFilters.push({
      key: "status",
      label: `Status: ${state.status.charAt(0).toUpperCase() + state.status.slice(1)}`
    });
  }

  if (state.stockStatus !== "all") {
    activeFilters.push({
      key: "stockStatus",
      label: `Stock: ${state.stockStatus.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`
    });
  }

  if (state.minPrice) {
    activeFilters.push({ key: "minPrice", label: `Min Price: $${state.minPrice}` });
  }

  if (state.maxPrice) {
    activeFilters.push({ key: "maxPrice", label: `Max Price: $${state.maxPrice}` });
  }

  // Check dynamic custom fields
  Object.keys(state).forEach(key => {
    if (key.startsWith("custom_") && state[key] && state[key] !== "all") {
      const fieldId = key.replace("custom_", "");
      const fieldDef = customFields.find(f => f.id === fieldId);
      const name = fieldDef?.name || fieldId.replace(/_/g, ' ');
      
      let displayValue = state[key];
      if (fieldDef?.type === "CHECKBOX") {
        displayValue = state[key] === 'true' ? 'Yes' : 'No';
      }

      activeFilters.push({
        key,
        label: `${name}: ${displayValue}`
      });
    }
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 animate-in fade-in">
      <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
      {activeFilters.map((filter) => (
        <Badge key={filter.key} variant="secondary" className="px-2 py-1 gap-1 text-xs bg-muted/50 hover:bg-muted border border-border">
          {filter.label}
          <button 
            type="button"
            onClick={() => updateState({ [filter.key]: "" })}
            className="rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-1"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </button>
        </Badge>
      ))}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={clearFilters}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}
