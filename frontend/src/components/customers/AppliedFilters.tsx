"use client";

import { CustomerUrlState } from "@/hooks/useCustomerUrlState";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AppliedFiltersProps {
  state: CustomerUrlState;
  updateState: (updates: Partial<CustomerUrlState>) => void;
}

export function AppliedFilters({ state, updateState }: AppliedFiltersProps) {
  const filters: { label: string; value: string; onRemove: () => void }[] = [];

  if (state.status !== "all") {
    filters.push({
      label: "Status",
      value: state.status === "active" ? "Active" : "Inactive",
      onRemove: () => updateState({ status: "all" })
    });
  }

  if (state.date !== "all") {
    let dateLabel = state.date;
    if (state.date === "today") dateLabel = "Today";
    else if (state.date === "thisWeek") dateLabel = "This Week";
    else if (state.date === "thisMonth") dateLabel = "This Month";
    
    filters.push({
      label: "Date Joined",
      value: dateLabel,
      onRemove: () => updateState({ date: "all" })
    });
  }

  if (state.hasFields !== "all") {
    filters.push({
      label: "Custom Fields",
      value: state.hasFields === "yes" ? "Yes" : "No",
      onRemove: () => updateState({ hasFields: "all" })
    });
  }

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 animate-in fade-in">
      <span className="text-xs text-muted-foreground font-medium">Applied Filters:</span>
      {filters.map((filter, index) => (
        <Badge key={index} variant="secondary" className="px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="text-xs font-normal text-muted-foreground">{filter.label}:</span>
          <span className="text-xs font-medium">{filter.value}</span>
          <button 
            onClick={filter.onRemove}
            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 focus:outline-none"
          >
            <X className="w-3 h-3" />
            <span className="sr-only">Remove {filter.label} filter</span>
          </button>
        </Badge>
      ))}
      <button 
        onClick={() => updateState({ status: "all", date: "all", hasFields: "all" })}
        className="text-xs text-primary hover:underline ml-2"
      >
        Clear all
      </button>
    </div>
  );
}
