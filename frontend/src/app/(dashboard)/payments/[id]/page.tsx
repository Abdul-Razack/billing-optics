import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PaymentMethodBadge, PaymentStatusBadge } from "@/components/payments/PaymentBadges";
import { MOCK_PAYMENTS } from "@/lib/mock-payment-data";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { PrintButton } from "@/components/shared/PrintButton";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  if (!resolvedParams.id || resolvedParams.id === "undefined") {
    notFound();
  }

  const payment = MOCK_PAYMENTS.find(p => p.id === resolvedParams.id);
  
  if (!payment) {
    notFound();
  }

  const customer = MOCK_CUSTOMERS.find(c => c.id === payment.customerId);

  return (
    <PageContainer title="Payment Details" description={`Transaction ID: ${payment.id.toUpperCase()}`}>
      <div className="mb-6 print:hidden">
        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/payments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Payment Summary</h1>
        <PrintButton label="Print Receipt" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
              <span className="font-medium">Transaction Details</span>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Amount Paid</span>
                <span className="text-3xl font-bold text-foreground">₹{payment.amount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Payment Method</span>
                <PaymentMethodBadge method={payment.method} />
              </div>
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Date Recorded</span>
                <span className="font-medium">{new Date(payment.date).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Reference Number</span>
                <span className="font-medium">{payment.referenceNumber || "—"}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-medium mb-4">Internal Notes</h3>
            <p className="text-muted-foreground">{payment.notes || "No notes provided for this transaction."}</p>
            <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
              Recorded by: <span className="font-medium text-foreground">{payment.recordedBy}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-medium mb-4 flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Associated Invoice
            </h3>
            <div className="p-4 bg-muted/50 rounded border border-border">
              <span className="text-sm text-muted-foreground block mb-1">Invoice ID</span>
              <span className="font-medium text-lg">{payment.invoiceId}</span>
              <Button variant="link" className="px-0 mt-2 h-auto" asChild>
                <Link href={`/invoices/${payment.invoiceId}`}>View Invoice →</Link>
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-medium mb-4">Customer Info</h3>
            {customer ? (
              <div>
                <span className="font-semibold block">{customer.fullName}</span>
                <span className="text-sm text-muted-foreground block mt-1">{customer.phone}</span>
                <span className="text-sm text-muted-foreground block">{customer.email}</span>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={`/customers/${customer.id}`}>View Customer Profile</Link>
                </Button>
              </div>
            ) : (
              <span className="text-muted-foreground">Unknown Customer</span>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
