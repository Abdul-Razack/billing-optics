"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus, Download, Grid3X3, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { useFetch } from "@/hooks/useApi";
import { LensGridModal } from "@/components/purchases/LensGridModal";

export default function PurchasesHistoryPage() {
  const { data: response, isLoading, error } = useFetch<{ success: boolean; data: any[] }>("/purchases");
  const purchases = response?.data || [];

  const [lensGridPurchaseId, setLensGridPurchaseId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);

  const STATUS_STYLE: Record<string, string> = {
    COMPLETED:            "bg-green-500/10 text-green-700 border-green-500/30",
    PENDING_CONFIRMATION: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
    DRAFT:                "bg-muted text-muted-foreground border-border",
    CANCELLED:            "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <PageContainer title="Purchase History" description="Manage all incoming stock, challans, and invoices.">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Purchase Bills
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{purchases.length} record(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/purchases/new">
              <Plus className="mr-2 h-4 w-4" />
              New Purchase
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Loading purchases…</div>
      ) : error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">Failed to load purchases.</div>
      ) : purchases.length === 0 ? (
        <EmptyState
          title="No Purchases Found"
          description="You haven't recorded any purchases yet."
          actionLabel="Create Purchase"
          actionHref="/purchases/new"
          icon={Plus}
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bill No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium font-mono">
                    {purchase.billNumber || <span className="text-muted-foreground italic">Draft</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">Supplier #{purchase.supplierId}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[purchase.status] || "bg-muted text-muted-foreground border-border"}`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono">
                    ₹{(purchase.netAmount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => setLensGridPurchaseId(purchase.id)}
                      title="Open Lens Power Grid to bulk-add Rx lenses"
                    >
                      <Grid3X3 className="h-3.5 w-3.5" />
                      Lens Grid
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lens Grid Modal */}
      {lensGridPurchaseId !== null && (
        <LensGridModal
          purchaseId={lensGridPurchaseId}
          isOpen={true}
          onClose={() => setLensGridPurchaseId(null)}
          onSuccess={() => setRefresh(r => r + 1)}
        />
      )}
    </PageContainer>
  );
}
