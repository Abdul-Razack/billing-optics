"use client";

import { CustomerUrlState } from "@/hooks/useCustomerUrlState";
import { Label } from "@/components/ui/label";

interface CustomerFiltersProps {
  state: CustomerUrlState;
  updateState: (updates: Partial<CustomerUrlState>) => void;
}

export function CustomerFilters({ state, updateState }: CustomerFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-md border border-border bg-card/50 mt-4 animate-in fade-in slide-in-from-top-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Status</Label>
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
        <Label className="text-xs font-medium text-muted-foreground">Date Joined</Label>
        <select 
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={state.date}
          onChange={(e) => updateState({ date: e.target.value })}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Has Custom Fields</Label>
        <select 
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={state.hasFields}
          onChange={(e) => updateState({ hasFields: e.target.value })}
        >
          <option value="all">All Customers</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>
  );
}
