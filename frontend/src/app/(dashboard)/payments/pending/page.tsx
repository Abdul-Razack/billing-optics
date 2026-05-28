import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { MOCK_PENDING_PAYMENTS } from "@/lib/mock-payment-data";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, CreditCard, ChevronRight } from "lucide-react";

export default function PendingPaymentsPage() {
  const totalDues = MOCK_PENDING_PAYMENTS.reduce((acc, p) => acc + p.totalOutstanding, 0);

  return (
    <PageContainer title="Pending Dues" description="Customers with outstanding invoice balances.">
      <ProductHeader title="Outstanding Payments">
        <Button variant="outline" asChild>
          <Link href="/payments">Back to Payments</Link>
        </Button>
      </ProductHeader>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-800 uppercase tracking-wider mb-1">Total Outstanding</p>
            <p className="text-3xl font-bold text-red-950">₹{totalDues.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PENDING_PAYMENTS.map((pending, i) => {
          const customer = MOCK_CUSTOMERS.find(c => c.id === pending.customerId);
          return (
            <div key={i} className="bg-card rounded-lg border border-border shadow-sm flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{customer?.fullName || "Unknown Customer"}</h3>
                    <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                  </div>
                  <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium">
                    {pending.invoiceCount} unpaid invoice(s)
                  </div>
                </div>
                
                <div className="space-y-3 mt-6 border-t border-border pt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-muted-foreground">Due Amount</span>
                    <span className="text-xl font-bold text-foreground">₹{pending.totalOutstanding.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Oldest Invoice From</span>
                    <span className="font-medium text-orange-600">
                      {new Date(pending.oldestInvoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border bg-muted/30 grid grid-cols-2 gap-3 mt-auto">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/invoices?customer=${pending.customerId}`}>
                    View Invoices
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full">
                  <Link href={`/payments/new?customer=${pending.customerId}&amount=${pending.totalOutstanding}`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
