"use client";

import { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductListTable } from "@/components/products/ProductListTable";
import { ProductService, ApiProduct } from "@/services/product.service";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { SettingsService } from "@/services/settings.service";
import { CustomField } from "@/types/custom-field";
import { useFetch } from "@/hooks/useApi";
import { useProductUrlState } from "@/hooks/useProductUrlState";
import { StockSummary } from "@/components/products/StockSummary";
import { calculateStockStatus } from "@/lib/stock";
import { exportToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, PackagePlus, Tags } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProductSearchInput } from "@/components/products/ProductSearchInput";
import { ProductFilterDrawer } from "@/components/products/ProductFilterDrawer";
import { ProductSortDropdown, ProductSortOption } from "@/components/products/ProductSortDropdown";
import { AppliedProductFilters } from "@/components/products/AppliedProductFilters";
import { ProductBulkToolbar, ProductBulkActionType } from "@/components/products/ProductBulkToolbar";
import { BulkActionConfirmation } from "@/components/products/BulkActionConfirmation";
import { BulkStockModal } from "@/components/products/BulkStockModal";
import { BulkCategoryModal } from "@/components/products/BulkCategoryModal";
import { ProductExportModal } from "@/components/products/ProductExportModal";

export default function ProductsPage() {
  const { state, updateState, clearFilters } = useProductUrlState();
  
  // We fetch ALL products, then filter locally to guarantee advanced filters work if backend lacks support
  const { data: response, isLoading, isFetching, error, refetch } = useFetch<{ success: boolean, data: ApiProduct[] }>("/products?limit=5000");
  const { data: catResponse } = useFetch<{ success: boolean, data: ApiCategory[] }>("/categories");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    SettingsService.getSettings()
      .then((res) => setCustomFields(res.customFieldDefinitions?.products || []))
      .catch(console.error);
  }, []);

  const products = response?.data || [];
  const categories = catResponse?.data || [];

  // Stock Update Modal State
  const [stockUpdateProduct, setStockUpdateProduct] = useState<ApiProduct | null>(null);
  const [newStockValue, setNewStockValue] = useState<string>("");
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Bulk Operations State
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [bulkAction, setBulkAction] = useState<ProductBulkActionType | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkStockOpen, setIsBulkStockOpen] = useState(false);
  const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (state.search) {
      const q = state.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q) || 
        p.barcode?.toLowerCase().includes(q)
      );
    }

    // Category
    if (state.categoryId !== "all") {
      result = result.filter(p => p.categoryId.toString() === state.categoryId);
    }

    // Status
    if (state.status !== "all") {
      const isActive = state.status === "active";
      result = result.filter(p => p.isActive === isActive);
    }

    // Stock Status
    if (state.stockStatus !== "all") {
      result = result.filter(p => {
        const { status } = calculateStockStatus(p.stock ?? (p as any).currentStock, p.minStockAlert);
        if (state.stockStatus === "in-stock") return status === "IN_STOCK";
        if (state.stockStatus === "low-stock") return status === "LOW_STOCK";
        if (state.stockStatus === "out-of-stock") return status === "OUT_OF_STOCK";
        return true;
      });
    }

    // Price
    if (state.minPrice) {
      const min = parseFloat(state.minPrice);
      result = result.filter(p => (p.sellingPrice || 0) >= min);
    }
    if (state.maxPrice) {
      const max = parseFloat(state.maxPrice);
      result = result.filter(p => (p.sellingPrice || 0) <= max);
    }

    // Custom Fields
    Object.keys(state).forEach(key => {
      if (key.startsWith("custom_") && state[key] && state[key] !== "all") {
        const attrId = key.replace("custom_", "");
        const filterVal = state[key];
        result = result.filter(p => {
          const val = p.attributes?.[attrId];
          if (filterVal === "true") return val === true;
          if (filterVal === "false") return val === false || val === undefined || val === null;
          return String(val).toLowerCase().includes(filterVal.toLowerCase());
        });
      }
    });

    // Sorting
    result.sort((a, b) => {
      switch (state.sort) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        case "price-desc":
          return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        case "stock-asc":
          return ((a.stock ?? (a as any).currentStock) || 0) - ((b.stock ?? (b as any).currentStock) || 0);
        case "stock-desc":
          return ((b.stock ?? (b as any).currentStock) || 0) - ((a.stock ?? (a as any).currentStock) || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [products, state]);

  const stockCounts = filteredProducts.reduce((acc, product) => {
    const { status } = calculateStockStatus(product.stock ?? (product as any).currentStock, product.minStockAlert);
    acc.total += 1;
    if (status === "IN_STOCK") acc.healthy += 1;
    if (status === "LOW_STOCK") acc.lowStock += 1;
    if (status === "OUT_OF_STOCK") acc.outOfStock += 1;
    return acc;
  }, { total: 0, healthy: 0, lowStock: 0, outOfStock: 0 });

  const handleDelete = async (id: number) => {
    try {
      await ProductService.deleteProduct(id);
      toast.success("Product deleted successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
    }
  };

  const getSelectedProductIds = () => {
    return Object.keys(rowSelection).filter(key => rowSelection[key]).map(Number);
  };

  const handleBulkAction = (action: ProductBulkActionType) => {
    setBulkAction(action);
    if (action === "stock") {
      setIsBulkStockOpen(true);
    } else if (action === "category") {
      setIsBulkCategoryOpen(true);
    } else if (action === "export") {
      setIsExportModalOpen(true);
    } else {
      setIsConfirmOpen(true);
    }
  };

  const handleBulkConfirm = async () => {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0 || !bulkAction) return;

    setIsProcessingBulk(true);
    try {
      const promises = selectedIds.map(id => {
        if (bulkAction === "delete") {
          return ProductService.deleteProduct(id);
        } else if (bulkAction === "activate") {
          return ProductService.updateProduct(id, { isActive: true });
        } else if (bulkAction === "deactivate") {
          return ProductService.updateProduct(id, { isActive: false });
        }
        return Promise.resolve();
      });

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === "fulfilled").length;
      const failCount = results.filter(r => r.status === "rejected").length;

      if (failCount === 0) {
        toast.success(`Successfully processed ${successCount} products.`);
      } else {
        toast.warning(`Processed ${successCount} products. Failed on ${failCount}.`);
      }

      setRowSelection({});
      setIsConfirmOpen(false);
      refetch();
    } catch (error) {
      toast.error("An error occurred during bulk operation.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleBulkStockConfirm = async (minStockAlert: number) => {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0) return;

    setIsProcessingBulk(true);
    try {
      const promises = selectedIds.map(id => 
        ProductService.updateProduct(id, { minStockAlert })
      );

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === "fulfilled").length;
      
      toast.success(`Successfully updated stock for ${successCount} products.`);
      setRowSelection({});
      setIsBulkStockOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update bulk stock.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleBulkCategoryConfirm = async (categoryId: number) => {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0) return;

    setIsProcessingBulk(true);
    try {
      const promises = selectedIds.map(id => 
        ProductService.updateProduct(id, { categoryId })
      );

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === "fulfilled").length;
      
      toast.success(`Successfully assigned category to ${successCount} products.`);
      setRowSelection({});
      setIsBulkCategoryOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to assign bulk category.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleQuickStockUpdate = (product: ApiProduct) => {
    setStockUpdateProduct(product);
    const current = product.stock ?? (product as any).currentStock ?? product.minStockAlert ?? 0;
    setNewStockValue(current.toString());
  };

  const submitStockUpdate = async () => {
    if (!stockUpdateProduct) return;
    const stockNum = parseInt(newStockValue, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }

    setIsUpdatingStock(true);
    try {
      await ProductService.updateProduct(stockUpdateProduct.id, {
        minStockAlert: stockNum,
      });
      toast.success("Stock updated successfully!");
      setStockUpdateProduct(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update stock");
    } finally {
      setIsUpdatingStock(false);
    }
  };



  return (
    <PageContainer title="Products" description="Manage your product inventory and catalog.">
      <ProductHeader 
        title="All Products" 
        action={{ label: "Add Product", href: "/products/create" }} 
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/categories">
              <Tags className="mr-2 h-4 w-4" />
              Categories
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products/import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
        </div>
      </ProductHeader>
      
      {error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
          Failed to load products. Please try again.
        </div>
      ) : (
        <div className="space-y-6">
          <StockSummary 
            total={stockCounts.total}
            healthy={stockCounts.healthy}
            lowStock={stockCounts.lowStock}
            outOfStock={stockCounts.outOfStock}
            activeFilter={state.stockStatus === 'in-stock' ? 'IN_STOCK' : state.stockStatus === 'low-stock' ? 'LOW_STOCK' : state.stockStatus === 'out-of-stock' ? 'OUT_OF_STOCK' : 'all'}
            onFilterChange={(f) => updateState({ stockStatus: f === 'all' ? 'all' : f === 'IN_STOCK' ? 'in-stock' : f === 'LOW_STOCK' ? 'low-stock' : 'out-of-stock' })}
          />

          <div className="bg-card rounded-lg border border-border shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex-1 w-full flex items-center gap-2">
                <ProductSearchInput 
                  initialValue={state.search} 
                  onSearch={(s) => updateState({ search: s })} 
                  isSearching={isLoading || isFetching}
                />
                <ProductFilterDrawer 
                  state={state} 
                  updateState={updateState} 
                  clearFilters={clearFilters}
                  categories={categories}
                  customFields={customFields}
                />
              </div>
              <ProductSortDropdown 
                value={state.sort as ProductSortOption} 
                onChange={(s) => updateState({ sort: s })} 
              />
            </div>
            
            <AppliedProductFilters 
              state={state} 
              updateState={updateState} 
              clearFilters={clearFilters} 
              categories={categories}
              customFields={customFields}
            />
          </div>

          <ProductListTable 
            data={filteredProducts} 
            categories={categories}
            isLoading={isLoading} 
            onDelete={handleDelete} 
            onQuickStockUpdate={handleQuickStockUpdate}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        </div>
      )}

      {/* Bulk Operations UI */}
      <ProductBulkToolbar 
        selectedCount={Object.keys(rowSelection).filter(k => rowSelection[k]).length} 
        onClearSelection={() => setRowSelection({})} 
        onAction={handleBulkAction} 
      />

      <BulkActionConfirmation 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleBulkConfirm} 
        actionType={bulkAction} 
        selectedCount={Object.keys(rowSelection).filter(k => rowSelection[k]).length} 
        isProcessing={isProcessingBulk} 
      />

      <BulkStockModal 
        isOpen={isBulkStockOpen} 
        onClose={() => setIsBulkStockOpen(false)} 
        onConfirm={handleBulkStockConfirm} 
        selectedCount={Object.keys(rowSelection).filter(k => rowSelection[k]).length} 
        isProcessing={isProcessingBulk} 
      />

      <BulkCategoryModal 
        isOpen={isBulkCategoryOpen} 
        onClose={() => setIsBulkCategoryOpen(false)} 
        onConfirm={handleBulkCategoryConfirm} 
        selectedCount={Object.keys(rowSelection).filter(k => rowSelection[k]).length} 
        isProcessing={isProcessingBulk} 
        categories={categories}
      />

      {/* Quick Stock Update Modal */}
      <Dialog open={!!stockUpdateProduct} onOpenChange={(open) => !open && setStockUpdateProduct(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              Quick Stock Update
            </DialogTitle>
            <DialogDescription>
              Update inventory level for <strong className="text-foreground">{stockUpdateProduct?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label htmlFor="stockValue" className="text-sm font-medium">New Stock Quantity</label>
              <Input 
                id="stockValue"
                type="NUMBER"
                min="0"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockUpdateProduct(null)} disabled={isUpdatingStock}>
              Cancel
            </Button>
            <Button onClick={submitStockUpdate} disabled={isUpdatingStock}>
              {isUpdatingStock ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        products={filteredProducts}
        selectedIds={Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number)}
        totalCount={products.length}
      />
    </PageContainer>
  );
}
