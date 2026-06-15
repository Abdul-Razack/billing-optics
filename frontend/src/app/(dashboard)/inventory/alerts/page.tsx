"use client";

import { useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { StockAlertCard } from "@/components/inventory/StockAlertCard";
import { InventoryAlertFilters } from "@/components/inventory/InventoryAlertFilters";
import { AlertSeverityBadge } from "@/components/inventory/AlertSeverityBadge";
import { AlertActionDropdown } from "@/components/inventory/AlertActionDropdown";
import { StockAdjustmentForm } from "@/components/inventory/StockAdjustmentForm";
import { ProductService, ApiProduct } from "@/services/product.service";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { calculateAlertSeverity, AlertSeverity } from "@/lib/alerts";
import { useFetch } from "@/hooks/useApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, AlertOctagon, AlertCircle, BellRing, Box } from "lucide-react";
import { toast } from "sonner";

export default function LowStockAlertsPage() {
  const { data: response, isLoading: isLoadingProducts, error, refetch } = useFetch<{ success: boolean, data: ApiProduct[] }>("/products");
  const { data: catResponse } = useFetch<{ success: boolean, data: ApiCategory[] }>("/categories");

  const products = response?.data || [];
  const categories = catResponse?.data || [];

  // Local State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<number>>(new Set());

  // Quick Edit State
  const [stockUpdateProduct, setStockUpdateProduct] = useState<ApiProduct | null>(null);

  // Filter to only items that trigger an alert
  const alertProducts = useMemo(() => {
    return products.map(product => {
      const stock = (product as any).stock ?? 0;
      const { severity, isAlert } = calculateAlertSeverity(stock, product.minStockAlert);
      return { ...product, currentStock: stock, severity, isAlert };
    }).filter(p => p.isAlert && !reviewedProductIds.has(p.id));
  }, [products, reviewedProductIds]);

  // Compute KPI Stats based on ALL active alerts (ignoring search filters, but respecting reviewed state)
  const { lowStockCount, criticalCount, outOfStockCount } = useMemo(() => {
    let low = 0;
    let critical = 0;
    let out = 0;
    alertProducts.forEach(p => {
      if (p.severity === "EMERGENCY") out++;
      else if (p.severity === "CRITICAL") critical++;
      else if (p.severity === "WARNING") low++;
    });
    return { lowStockCount: low, criticalCount: critical, outOfStockCount: out };
  }, [alertProducts]);

  // Final UI filtering for the table
  const displayedAlerts = useMemo(() => {
    let result = [...alertProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(p => p.categoryId.toString() === categoryFilter);
    }

    if (severityFilter !== "all") {
      result = result.filter(p => p.severity === severityFilter);
    }

    return result.sort((a, b) => {
      // Sort Emergency -> Critical -> Warning
      const sevMap = { "EMERGENCY": 3, "CRITICAL": 2, "WARNING": 1, "OK": 0 };
      return sevMap[b.severity] - sevMap[a.severity];
    });
  }, [alertProducts, searchQuery, categoryFilter, severityFilter]);

  const handleMarkReviewed = (product: ApiProduct) => {
    setReviewedProductIds(prev => {
      const newSet = new Set(prev);
      newSet.add(product.id);
      return newSet;
    });
    toast.success(`${product.name} dismissed from current session.`);
  };

  return (
    <PageContainer title="Low Stock Alerts" description="Monitor and action products that are running low or out of stock.">
      <ProductHeader title="Alerts Dashboard" />

      {/* KPI Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6 mb-8">
        <StockAlertCard 
          title="Active Alerts" 
          value={alertProducts.length} 
          icon={BellRing} 
          description="Total items needing attention"
          isLoading={isLoadingProducts}
        />
        <StockAlertCard 
          title="Out of Stock" 
          value={outOfStockCount} 
          icon={AlertOctagon} 
          description="Emergency stock-outs"
          colorClass="text-red-500"
          isLoading={isLoadingProducts}
        />
        <StockAlertCard 
          title="Critically Low" 
          value={criticalCount} 
          icon={AlertTriangle} 
          description="Under 50% of minimum threshold"
          colorClass="text-orange-500"
          isLoading={isLoadingProducts}
        />
        <StockAlertCard 
          title="Low Stock" 
          value={lowStockCount} 
          icon={AlertCircle} 
          description="Below minimum threshold"
          colorClass="text-yellow-500"
          isLoading={isLoadingProducts}
        />
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <InventoryAlertFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          severityFilter={severityFilter}
          onSeverityFilterChange={setSeverityFilter}
          categories={categories}
        />

        {error ? (
          <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
            Failed to load alert data. Please try again.
          </div>
        ) : isLoadingProducts ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Info</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Threshold</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-8 ml-auto" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-8 ml-auto" /></TableCell>
                    <TableCell><div className="h-6 bg-muted rounded-full animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-8 bg-muted rounded animate-pulse w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : displayedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-md border-dashed">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <Box className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              All Clear
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {alertProducts.length === 0 
                ? "Your inventory is healthy! There are no active low stock alerts."
                : "No active alerts match your current filters."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Product Info</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right font-medium">Stock</TableHead>
                  <TableHead className="text-right text-muted-foreground">Threshold</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAlerts.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{product.name}</span>
                          <span className="text-xs text-muted-foreground">{product.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                            {category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Uncategorized</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {product.currentStock}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {product.minStockAlert || 0}
                      </TableCell>
                      <TableCell>
                        <AlertSeverityBadge severity={product.severity} />
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <AlertActionDropdown 
                          product={product} 
                          onAdjustStock={setStockUpdateProduct}
                          onMarkReviewed={handleMarkReviewed}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

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
    </PageContainer>
  );
}
