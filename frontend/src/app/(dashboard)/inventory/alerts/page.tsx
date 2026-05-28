import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { LowStockCard } from "@/components/inventory/LowStockCard";
import { MOCK_STOCK_ALERTS } from "@/lib/mock-inventory-data";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LowStockAlertsPage() {
  return (
    <PageContainer title="Low Stock Alerts" description="Items that have fallen below their minimum required threshold.">
      <ProductHeader title="Needs Attention">
        <Button variant="outline" asChild>
          <Link href="/inventory">Back to Overview</Link>
        </Button>
      </ProductHeader>

      {MOCK_STOCK_ALERTS.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_STOCK_ALERTS.map(alert => (
            <LowStockCard key={alert.productId} alert={alert} />
          ))}
        </div>
      ) : (
        <EmptyState 
          title="All Good!" 
          description="No products are currently below their minimum stock threshold." 
        />
      )}
    </PageContainer>
  );
}
