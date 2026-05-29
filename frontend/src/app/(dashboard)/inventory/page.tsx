"use client";

import { useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { InventoryStatCard } from "@/components/inventory/InventoryStatCard";
import { InventoryActivityFeed } from "@/components/inventory/InventoryActivityFeed";
import { InventoryQuickActions } from "@/components/inventory/InventoryQuickActions";
import { CategoryStockSummary } from "@/components/inventory/CategoryStockSummary";
import { ProductService, ApiProduct } from "@/services/product.service";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { useFetch } from "@/hooks/useApi";
import { Package, Boxes, AlertTriangle, XOctagon, DollarSign } from "lucide-react";
import { calculateStockStatus } from "@/lib/stock";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function InventoryOverviewPage() {
  const { data: response, isLoading: isLoadingProducts, error: productsError } = useFetch<{ success: boolean, data: ApiProduct[] }>("/products");
  const { data: catResponse, isLoading: isLoadingCategories } = useFetch<{ success: boolean, data: ApiCategory[] }>("/categories");

  const products = response?.data || [];
  const categories = catResponse?.data || [];

  const isLoading = isLoadingProducts || isLoadingCategories;

  // Compute Inventory KPIs
  const {
    totalProducts,
    totalStockUnits,
    lowStockCount,
    outOfStockCount,
    totalValueCents
  } = useMemo(() => {
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValueCents = 0;

    products.forEach(p => {
      const currentStock = (p as any).currentStock ?? 0;
      const { status } = calculateStockStatus(currentStock, p.minStockAlert);
      
      totalStockUnits += currentStock;
      totalValueCents += (currentStock * (p.costPrice || 0));

      if (status === "LOW_STOCK") lowStockCount++;
      if (status === "OUT_OF_STOCK") outOfStockCount++;
    });

    return {
      totalProducts: products.length,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalValueCents
    };
  }, [products]);

  const totalValueDisplay = `$${(totalValueCents / 100).toFixed(2)}`;

  if (productsError) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN", "OPTOMETRIST"]}>
        <PageContainer title="Inventory Dashboard" description="Overview of your store's inventory and stock levels.">
          <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20 mt-6">
            Failed to load inventory data. Please try again.
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "OPTOMETRIST"]}>
      <PageContainer title="Inventory Dashboard" description="Overview of your store's inventory and stock levels.">
      
      {/* KPI Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mt-6 mb-8">
        <InventoryStatCard 
          title="Total Products" 
          value={totalProducts} 
          icon={Package} 
          description="Unique items in catalog"
          isLoading={isLoading}
        />
        <InventoryStatCard 
          title="Total Units" 
          value={totalStockUnits} 
          icon={Boxes} 
          description="Physical stock on hand"
          isLoading={isLoading}
        />
        <InventoryStatCard 
          title="Stock Value" 
          value={totalValueDisplay} 
          icon={DollarSign} 
          description="Estimated based on cost price"
          isLoading={isLoading}
        />
        <InventoryStatCard 
          title="Low Stock" 
          value={lowStockCount} 
          icon={AlertTriangle} 
          description="Items reaching min alert level"
          trend={lowStockCount > 0 ? { value: `${lowStockCount} items`, isPositive: false } : undefined}
          isLoading={isLoading}
        />
        <InventoryStatCard 
          title="Out of Stock" 
          value={outOfStockCount} 
          icon={XOctagon} 
          description="Items with 0 inventory"
          trend={outOfStockCount > 0 ? { value: "Action needed", isPositive: false } : undefined}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12 mb-8">
        {/* Left Column - 8/12 */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <InventoryQuickActions />
          <CategoryStockSummary 
            products={products} 
            categories={categories} 
            isLoading={isLoading} 
          />
        </div>

        {/* Right Column - 4/12 */}
        <div className="md:col-span-4 h-full">
          <InventoryActivityFeed 
            products={products} 
            isLoading={isLoading} 
          />
        </div>
      </div>

    </PageContainer>
    </ProtectedRoute>
  );
}
