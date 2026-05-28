import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { InventorySummaryCard } from "@/components/inventory/InventorySummaryCard";
import { ActivityTimeline } from "@/components/inventory/ActivityTimeline";
import { ProductStockCard } from "@/components/inventory/ProductStockCard";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { MOCK_STOCK_ALERTS } from "@/lib/mock-inventory-data";
import { Package, AlertTriangle, ArrowUpRight, Archive } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InventoryOverviewPage() {
  const totalProducts = MOCK_PRODUCTS.length;
  const lowStockCount = MOCK_STOCK_ALERTS.length;
  const totalItemsInStock = MOCK_PRODUCTS.reduce((acc, p) => acc + p.currentStock, 0);

  return (
    <PageContainer title="Inventory Overview" description="Monitor stock levels, value, and recent activity.">
      <ProductHeader 
        title="Dashboard" 
        action={{ label: "Adjust Stock", href: "/inventory/adjustments/new" }} 
      >
        <Button variant="outline" asChild className="mr-2">
          <Link href="/inventory/ledger">View Ledger</Link>
        </Button>
      </ProductHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <InventorySummaryCard 
          title="Total Products" 
          value={totalProducts} 
          icon={<Package className="h-4 w-4" />} 
          description="Active catalog items"
        />
        <InventorySummaryCard 
          title="Items in Stock" 
          value={totalItemsInStock} 
          icon={<Archive className="h-4 w-4" />} 
          description="Total physical units"
        />
        <InventorySummaryCard 
          title="Low Stock Alerts" 
          value={lowStockCount} 
          icon={<AlertTriangle className="h-4 w-4 text-orange-500" />} 
          description="Items needing reorder"
          className={lowStockCount > 0 ? "border-orange-200 bg-orange-50/50" : ""}
        />
        <InventorySummaryCard 
          title="Recent Purchases" 
          value="4" 
          icon={<ArrowUpRight className="h-4 w-4 text-green-500" />} 
          trend={{ value: 12, isPositive: true }}
          description="vs last week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium text-foreground">Stock Health Overview</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_PRODUCTS.slice(0, 6).map(product => (
                <ProductStockCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <ActivityTimeline />
        </div>
      </div>
    </PageContainer>
  );
}
