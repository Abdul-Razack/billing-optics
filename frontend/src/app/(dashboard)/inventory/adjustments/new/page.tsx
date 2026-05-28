import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { StockAdjustmentForm } from "@/components/inventory/StockAdjustmentForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StockAdjustmentPage() {
  return (
    <PageContainer title="Stock Adjustment" description="Manually correct stock levels or record shrinkage.">
      <ProductHeader title="New Adjustment">
        <Button variant="outline" asChild>
          <Link href="/inventory/ledger">View Ledger</Link>
        </Button>
      </ProductHeader>
      
      <StockAdjustmentForm />
    </PageContainer>
  );
}
