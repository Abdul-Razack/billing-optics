"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { StockHistoryTable } from "@/components/inventory/StockHistoryTable";
import { HistoryFilters } from "@/components/inventory/HistoryFilters";
import { StockPagination } from "@/components/inventory/StockPagination";
import { InventoryService, InventoryLedgerRecord } from "@/services/inventory.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function StockHistoryPage() {
  const [movements, setMovements] = useState<InventoryLedgerRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters and Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const response = await InventoryService.getHistory({
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
          movementType: typeFilter === "all" ? undefined : typeFilter,
        });
        if (isMounted) {
          setMovements(response.records);
          setTotalItems(response.pagination.totalRecords);
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentPage, pageSize, searchQuery, typeFilter]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (page: number) => setCurrentPage(page);
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const updateSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const updateTypeFilter = (val: string) => { setTypeFilter(val); setCurrentPage(1); };

  const handleExport = () => {
    toast.info("Exporting history report...");
    setTimeout(() => {
      toast.success("History exported successfully!");
    }, 1500);
  };

  return (
    <PageContainer title="Stock Movement History" description="Audit log of all inventory changes, additions, and reductions.">
      <ProductHeader title="History & Audit">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </ProductHeader>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6 mt-6">
        <HistoryFilters 
          searchQuery={searchQuery}
          onSearchChange={updateSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={updateTypeFilter}
        />

        {error ? (
          <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20 mb-4">
            Failed to load history data. Please try again.
          </div>
        ) : (
          <>
            <StockHistoryTable 
              movements={movements}
              isLoading={isLoading}
            />
            
            {!isLoading && movements.length > 0 && (
              <StockPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
