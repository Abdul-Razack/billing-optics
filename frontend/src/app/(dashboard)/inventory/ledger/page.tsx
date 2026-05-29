"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryService, InventoryLedgerRecord } from "@/services/inventory.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InventoryLedgerPage() {
  const [data, setData] = useState<InventoryLedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLedger() {
      try {
        setLoading(true);
        const res = await InventoryService.getHistory({ limit: 100 });
        setData(res.records);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load inventory ledger");
      } finally {
        setLoading(false);
      }
    }
    fetchLedger();
  }, []);

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
      
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <InventoryTable data={data as any} />
      )}
    </PageContainer>
  );
}
