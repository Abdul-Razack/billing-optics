"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductService, ApiProduct } from "@/services/product.service";
import { ApiCategory } from "@/services/category.service";
import { useFetch } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { StockSummary } from "@/components/products/StockSummary";
import { calculateStockStatus } from "@/lib/stock";
import { exportToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const queryParams = new URLSearchParams();
  if (selectedCategoryId) queryParams.append("categoryId", selectedCategoryId);
  if (debouncedSearchTerm) queryParams.append("search", debouncedSearchTerm);
  
  const queryString = queryParams.toString();
  const productsUrl = queryString ? `/products?${queryString}` : "/products";

  const { data: response, isLoading, error, refetch } = useFetch<{ success: boolean, data: ApiProduct[] }>(productsUrl);
  const { data: catResponse } = useFetch<{ success: boolean, data: ApiCategory[] }>("/categories");
  
  const products = response?.data || [];
  const categories = catResponse?.data || [];

  const [stockFilter, setStockFilter] = useState<string>("all");

  const stockCounts = products.reduce((acc, product) => {
    const { status } = calculateStockStatus((product as any).currentStock, product.minStockAlert);
    acc.total += 1;
    if (status === "IN_STOCK") acc.healthy += 1;
    if (status === "LOW_STOCK") acc.lowStock += 1;
    if (status === "OUT_OF_STOCK") acc.outOfStock += 1;
    return acc;
  }, { total: 0, healthy: 0, lowStock: 0, outOfStock: 0 });

  const handleDelete = async (id: number) => {
    try {
      await ProductService.deleteProduct(id);
      refetch();
    } catch (err) {
      alert("Failed to delete product. Please try again.");
      console.error(err);
    }
  };

  const clearFilters = () => {
    setSelectedCategoryId("");
    setSearchTerm("");
  };

  const handleExport = () => {
    const exportColumns = [
      { header: "SKU", key: "sku" },
      { header: "Barcode", key: "barcode" },
      { header: "Name", key: "name" },
      { header: "Category", key: "categoryName" },
      { header: "Cost Price", key: "costPriceDisplay" },
      { header: "Selling Price", key: "sellingPriceDisplay" },
      { header: "GST %", key: "gstPercent" },
      { header: "Stock", key: "currentStock" },
      { header: "Min Stock Alert", key: "minStockAlert" },
      { header: "Status", key: "status" }
    ];

    const exportData = products.map(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      return {
        ...p,
        categoryName: cat ? cat.name : "Unknown",
        costPriceDisplay: p.costPrice ? (p.costPrice / 100).toFixed(2) : "0.00",
        sellingPriceDisplay: p.sellingPrice ? (p.sellingPrice / 100).toFixed(2) : "0.00",
        status: p.isActive ? "Active" : "Inactive"
      };
    });

    exportToCSV(exportData, exportColumns, "products_export");
  };

  return (
    <PageContainer title="Products" description="Manage your product inventory and catalog.">
      <ProductHeader 
        title="All Products" 
        action={{ label: "Add Product", href: "/products/new" }} 
      >
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products/import">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Link>
        </Button>
      </ProductHeader>
      {error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
          Failed to load products. Please try again.
        </div>
      ) : (
        <>
          <StockSummary 
            total={stockCounts.total}
            healthy={stockCounts.healthy}
            lowStock={stockCounts.lowStock}
            outOfStock={stockCounts.outOfStock}
            activeFilter={stockFilter}
            onFilterChange={setStockFilter}
          />
          <ProductTable 
            data={products} 
            categories={categories}
            isLoading={isLoading} 
            onDelete={handleDelete} 
            selectedCategoryId={selectedCategoryId}
            onCategoryFilterChange={setSelectedCategoryId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearFilters={clearFilters}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
          />
        </>
      )}
    </PageContainer>
  );
}
