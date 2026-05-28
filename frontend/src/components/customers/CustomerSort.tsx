"use client";

import { CustomerUrlState } from "@/hooks/useCustomerUrlState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface CustomerSortProps {
  state: CustomerUrlState;
  updateState: (updates: Partial<CustomerUrlState>) => void;
}

export function CustomerSort({ state, updateState }: CustomerSortProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground">
        <ArrowUpDown className="w-4 h-4" />
      </div>
      <Select
        value={state.sort}
        onValueChange={(value) => updateState({ sort: value || undefined })}
      >
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="createdAt-desc">Newest First</SelectItem>
          <SelectItem value="createdAt-asc">Oldest First</SelectItem>
          <SelectItem value="updatedAt-desc">Recent Activity</SelectItem>
          <SelectItem value="fullName-asc">Name (A-Z)</SelectItem>
          <SelectItem value="fullName-desc">Name (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
