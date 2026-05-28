import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { MOCK_INVENTORY_TRANSACTIONS } from "@/lib/mock-inventory-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InventoryLedgerPage() {
  return (
    <PageContainer title="Inventory Ledger" description="View all historical stock transactions and movements.">
      <ProductHeader title="Transaction Ledger">
        <Button variant="outline" asChild className="mr-2">
          <Link href="/inventory">Back to Overview</Link>
        </Button>
        <Button asChild>
          <Link href="/inventory/adjustments/new">New Adjustment</Link>
        </Button>
      </ProductHeader>
      
      <InventoryTable data={MOCK_INVENTORY_TRANSACTIONS} />
    </PageContainer>
  );
}
