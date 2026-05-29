"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { ApiInvoice, PaginatedApiInvoiceResponse } from "@/types/invoice";
import { useFetch } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Filter, X, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState as useLocalState } from "react";
import { useInvoiceUrlState } from "@/hooks/useInvoiceUrlState";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InvoicesPage() {
  const { state, updateState, clearFilters } = useInvoiceUrlState();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(state.q || "");
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.q) {
      updateState({ q: debouncedSearch });
    }
  }, [debouncedSearch, state.q, updateState]);

  useEffect(() => {
    if (state.q !== localSearch) {
      setLocalSearch(state.q || "");
    }
  }, [state.q]);

  // Map client 0-indexed page to backend 1-indexed page
  const queryParams = new URLSearchParams({
    page: String(state.page + 1),
    limit: String(state.size),
  });

  if (state.q) queryParams.set("search", state.q);
  if (state.paymentStatus && state.paymentStatus !== "all") queryParams.set("paymentStatus", state.paymentStatus);
  if (state.sort) {
    const [sortBy, sortDirection] = state.sort.split("-");
    queryParams.set("sortBy", sortBy);
    queryParams.set("sortDirection", sortDirection);
  }

  const invoicesUrl = `/invoices?${queryParams.toString()}`;
  const { data: response, isLoading, error } = useFetch<{ success: boolean, data: ApiInvoice[], meta: any }>(invoicesUrl);
  
  const invoices = response?.data || [];
  const totalItems = response?.meta?.totalRecords || 0;

  const activeFiltersCount = [
    state.q,
    state.paymentStatus !== "all",
  ].filter(Boolean).length;

  return (
    <PageContainer title="Invoices" description="Manage all your billing and invoices.">
      <ProductHeader 
        title="All Invoices" 
        action={{ label: "Create Invoice", href: "/orders/create" }} 
      />

      {error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20 mb-4">
          Failed to load invoices. Please check your connection and try again.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 w-full max-w-sm relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice # or customer name..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className={activeFiltersCount > 0 && !state.q ? "border-primary text-primary" : ""}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card mb-4">
              <div className="space-y-1 w-full max-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground">Payment Status</label>
                <Select value={state.paymentStatus} onValueChange={(val) => updateState({ paymentStatus: val || undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {!isLoading && invoices.length === 0 && !state.q && state.paymentStatus === "all" ? (
            <EmptyState
              title="No Invoices Yet"
              description="You haven't generated any invoices. Create a new sale to see it listed here."
              actionLabel="Create Invoice"
              actionHref="/orders/create"
              icon={FileText}
            />
          ) : !isLoading && invoices.length === 0 ? (
            <div className="border border-border rounded-lg bg-card p-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">No invoices match your current search and filter criteria.</p>
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <InvoiceTable 
              data={invoices} 
              isLoading={isLoading} 
              totalItems={totalItems}
              state={state}
              updateState={updateState}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
