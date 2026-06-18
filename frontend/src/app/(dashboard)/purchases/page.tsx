"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { useFetch } from "@/hooks/useApi";

export default function PurchasesHistoryPage() {
  const { data: response, isLoading, error } = useFetch<{ success: boolean, data: any[] }>("/purchases");
  const purchases = response?.data || [];

  return (
    <PageContainer title="Purchase History" description="Manage all your incoming stock, challans, and invoices.">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Purchase Bills</h1>
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
        <div>Loading purchases...</div>
      ) : error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
          Failed to load purchases.
        </div>
      ) : purchases.length === 0 ? (
        <EmptyState
          title="No Purchases Found"
          description="You haven't recorded any purchases yet."
          actionLabel="Create Purchase"
          actionHref="/purchases/new"
          icon={Plus}
        />
      ) : (
        <div className="border rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Bill No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{purchase.billNumber || 'Draft'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Supplier #{purchase.supplierId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      purchase.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-right">
                    ₹{(purchase.netAmount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
