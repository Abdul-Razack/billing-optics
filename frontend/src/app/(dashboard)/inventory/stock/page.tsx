"use client";

import { useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { StockTable } from "@/components/inventory/StockTable";
import { StockPagination } from "@/components/inventory/StockPagination";
import { StockAdjustmentForm } from "@/components/inventory/StockAdjustmentForm";
import { ProductService, ApiProduct } from "@/services/product.service";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { useFetch } from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { calculateStockStatus } from "@/lib/stock";

import { BulkStockToolbar } from "@/components/inventory/BulkStockToolbar";
import { BulkAdjustmentModal } from "@/components/inventory/BulkAdjustmentModal";

export default function StockListingPage() {
  const { data: response, isLoading: isLoadingProducts, error, refetch } = useFetch<{ success: boolean, data: ApiProduct[] }>("/products");
  const { data: catResponse } = useFetch<{ success: boolean, data: ApiCategory[] }>("/categories");

  const products = response?.data || [];
  const categories = catResponse?.data || [];

  // Local State for Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Quick Edit State
  const [stockUpdateProduct, setStockUpdateProduct] = useState<ApiProduct | null>(null);
  
  // Bulk Edit State
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkAdjust, setShowBulkAdjust] = useState(false);

  // Client-side Filtering
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q) || 
        p.barcode?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(p => p.categoryId.toString() === categoryFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter(p => {
        const { status } = calculateStockStatus((p as any).currentStock ?? 0, p.minStockAlert);
        if (statusFilter === "in-stock") return status === "IN_STOCK";
        if (statusFilter === "low-stock") return status === "LOW_STOCK";
        if (statusFilter === "out-of-stock") return status === "OUT_OF_STOCK";
        return true;
      });
    }

    return result;
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // Client-side Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Handlers
  const handlePageChange = (page: number) => setCurrentPage(page);
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleQuickStockUpdate = (product: ApiProduct) => {
    setStockUpdateProduct(product);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedIds);
      paginatedProducts.forEach(p => newSelected.add(p.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      paginatedProducts.forEach(p => newSelected.delete(p.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const handleBulkExport = () => {
    toast.info(`Exporting ${selectedIds.size} products...`);
    setTimeout(() => toast.success("Export completed successfully."), 1500);
    setSelectedIds(new Set());
  };

  const handleBulkAdjustSuccess = () => {
    setSelectedIds(new Set());
    refetch();
  };

  // Reset pagination on filter changes
  const updateSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const updateCatFilter = (val: string | null) => { if (val) { setCategoryFilter(val); setCurrentPage(1); } };
  const updateStatusFilter = (val: string | null) => { if (val) { setStatusFilter(val); setCurrentPage(1); } };

  return (
    <PageContainer title="Stock Management" description="View and manage detailed inventory levels across all products.">
      <ProductHeader 
        title="Stock Listing" 
        action={{ label: "Import Stock", href: "/products/import" }} 
      >
        <Button variant="outline" onClick={() => window.location.href = "/products"}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </ProductHeader>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex-1 w-full md:max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search SKU or Name..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={updateCatFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={updateStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
          Failed to load stock data. Please try again.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <StockTable 
            products={paginatedProducts} 
            categories={categories} 
            isLoading={isLoadingProducts}
            searchQuery={searchQuery}
            onAdjustStock={handleQuickStockUpdate}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
          />
          
          <StockPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredProducts.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {stockUpdateProduct && (
        <StockAdjustmentForm 
          product={stockUpdateProduct}
          isOpen={!!stockUpdateProduct}
          onClose={() => setStockUpdateProduct(null)}
          onSuccess={() => {
            setStockUpdateProduct(null);
            refetch();
          }}
        />
      )}

      <BulkStockToolbar 
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkAdjust={() => setShowBulkAdjust(true)}
        onBulkExport={handleBulkExport}
      />

      {showBulkAdjust && (
        <BulkAdjustmentModal 
          products={products.filter(p => selectedIds.has(p.id))}
          isOpen={showBulkAdjust}
          onClose={() => setShowBulkAdjust(false)}
          onSuccess={handleBulkAdjustSuccess}
        />
      )}
    </PageContainer>
  );
}
