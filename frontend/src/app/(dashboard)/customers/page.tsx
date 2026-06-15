"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomerHeader } from "@/components/customers/CustomerHeader";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerSearch } from "@/components/customers/CustomerSearch";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CustomerSort } from "@/components/customers/CustomerSort";
import { AppliedFilters } from "@/components/customers/AppliedFilters";
import { ApiCustomer } from "@/types/customer";
import { useFetch } from "@/hooks/useApi";
import { exportToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Download, Upload, Filter, X, Users } from "lucide-react";
import { useCustomerUrlState } from "@/hooks/useCustomerUrlState";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { RowSelectionState } from "@tanstack/react-table";
import { BulkActionToolbar } from "@/components/customers/BulkActionToolbar";
import { BulkConfirmationModal, BulkActionType } from "@/components/customers/BulkConfirmationModal";
import { ExportModal } from "@/components/customers/ExportModal";
import { toast } from "sonner";
import { fetchClient } from "@/lib/api-client";

export default function CustomersPage() {
  const { state, updateState, clearFilters } = useCustomerUrlState();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Build API URL — pass isActive to the backend for server-side filtering
  const isActiveParam = state.status === "active" ? "true" : state.status === "inactive" ? "false" : undefined;
  const customersUrl = [
    state.q ? `search=${encodeURIComponent(state.q)}` : null,
    isActiveParam !== undefined ? `isActive=${isActiveParam}` : null,
    "limit=5000"
  ].filter(Boolean).join("&");
  const { data: response, isLoading, isFetching, error, refetch } = useFetch<{ success: boolean, data: ApiCustomer[] }>(`/customers?${customersUrl}`);
  
  const allCustomers = response?.data || [];
  
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkAction, setBulkAction] = useState<BulkActionType>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleBulkAction = (action: BulkActionType | "export" | "tags") => {
    if (action === "export") {
      setIsExportModalOpen(true);
      return;
    }

    if (action === "tags") {
      toast.error("Tag assignment is not yet supported by the backend.");
      return;
    }

    setBulkAction(action as BulkActionType);
  };

  const handleBulkConfirm = async () => {
    if (!bulkAction) return;
    setIsBulkProcessing(true);
    
    const selectedIds = Object.keys(rowSelection);
    let successCount = 0;
    let failureCount = 0;

    try {
      await Promise.all(selectedIds.map(async (id) => {
        try {
          if (bulkAction === "delete") {
            await fetchClient(`/customers/${id}`, { method: "DELETE" });
          } else {
            await fetchClient(`/customers/${id}`, { 
              method: "PATCH", 
              data: { isActive: bulkAction === "activate" } 
            });
          }
          successCount++;
        } catch (e) {
          failureCount++;
        }
      }));

      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} customers.`);
        setRowSelection({});
        refetch();
      }
      if (failureCount > 0) {
        toast.error(`Failed to process ${failureCount} customers.`);
      }
    } catch (e) {
      toast.error("An unexpected error occurred during bulk operation.");
    } finally {
      setIsBulkProcessing(false);
      setBulkAction(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetchClient(`/customers/${id}`, { method: "DELETE" });
      toast.success("Customer deleted successfully.");
      refetch();
    } catch (e) {
      toast.error("Failed to delete customer.");
    }
  };

  // Client-side filtering
  const filteredCustomers = useMemo(() => {
    let result = [...allCustomers];

    // Status filter — use Boolean() to handle SQLite 0/1 integers
    if (state.status !== "all") {
      const isActive = state.status === "active";
      result = result.filter(c => Boolean(c.isActive) === isActive);
    }

    // Has Custom Fields filter
    if (state.hasFields !== "all") {
      const has = state.hasFields === "yes";
      result = result.filter(c => {
        const count = c.customFields ? Object.keys(c.customFields).length : 0;
        return has ? count > 0 : count === 0;
      });
    }

    // Date filter
    if (state.date !== "all") {
      const now = new Date();
      result = result.filter(c => {
        const joined = new Date(c.createdAt);
        const diffDays = Math.ceil(Math.abs(now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
        
        if (state.date === "today") return diffDays <= 1;
        if (state.date === "thisWeek") return diffDays <= 7;
        if (state.date === "thisMonth") return diffDays <= 30;
        return true;
      });
    }

    // Sorting
    if (state.sort) {
      const [field, dir] = state.sort.split("-");
      result.sort((a, b) => {
        let valA = a[field as keyof ApiCustomer];
        let valB = b[field as keyof ApiCustomer];
        
        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        // Handle dates
        if (field === "createdAt" || field === "updatedAt") {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        } else if (typeof valA === "string" && typeof valB === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return dir === "asc" ? -1 : 1;
        if (valA > valB) return dir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allCustomers, state.status, state.hasFields, state.date, state.sort]);

  // Pagination slicing
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / state.size);
  // Ensure page is in bounds
  const safePage = Math.max(0, Math.min(state.page, Math.max(0, totalPages - 1)));
  
  const paginatedCustomers = useMemo(() => {
    const start = safePage * state.size;
    return filteredCustomers.slice(start, start + state.size);
  }, [filteredCustomers, safePage, state.size]);

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const activeFiltersCount = [
    state.q,
    state.status !== "all",
    state.date !== "all",
    state.hasFields !== "all"
  ].filter(Boolean).length;

  return (
    <PageContainer title="Customers" description="Manage your customer relationships and history.">
      <CustomerHeader 
        title="All Customers" 
        action={{ label: "Add Customer", href: "/customers/new" }} 
      >
        <Button variant="outline" onClick={handleExport} disabled={filteredCustomers.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" asChild>
          <Link href="/customers/import">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Link>
        </Button>
      </CustomerHeader>
      
      <BulkActionToolbar 
        selectedCount={Object.keys(rowSelection).length}
        onClearSelection={() => setRowSelection({})}
        onAction={handleBulkAction}
      />

      <BulkConfirmationModal
        isOpen={!!bulkAction}
        onClose={() => !isBulkProcessing && setBulkAction(null)}
        onConfirm={handleBulkConfirm}
        actionType={bulkAction}
        selectedCount={Object.keys(rowSelection).length}
        isProcessing={isBulkProcessing}
      />

      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        customers={filteredCustomers}
        selectedIds={Object.keys(rowSelection)}
        totalCount={allCustomers.length}
      />

      {error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
          Failed to load customers. Please try again.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <CustomerSearch initialValue={state.q} onSearch={(q) => updateState({ q })} isSearching={isLoading || isFetching} />
              
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
            
            <CustomerSort state={state} updateState={updateState} />
          </div>

          {showAdvancedFilters && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-2">
              <CustomerFilters state={state} updateState={updateState} />
            </div>
          )}

          <AppliedFilters state={state} updateState={updateState} />

          {!isLoading && allCustomers.length === 0 && !state.q ? (
            <EmptyState
              title="No Customers Yet"
              description="You haven't added any customers. Start building your database by creating a new customer or importing an existing list."
              actionLabel="Add Customer"
              actionHref="/customers/new"
              icon={Users}
            />
          ) : !isLoading && filteredCustomers.length === 0 ? (
            <div className="border border-border rounded-lg bg-card p-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">No customers match your current search and filter criteria.</p>
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <CustomerTable 
              data={paginatedCustomers} 
              isLoading={isLoading} 
              totalItems={totalItems}
              state={state}
              updateState={updateState}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
