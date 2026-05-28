import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { Invoice } from "@/types/invoice";
import { Printer, XCircle } from "lucide-react";

interface InvoiceHeaderProps {
  invoice: Invoice;
  children?: ReactNode;
}

export function InvoiceHeader({ invoice, children }: InvoiceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-6 bg-card rounded-lg border border-border shadow-sm">
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{invoice.invoiceNumber}</h1>
          <InvoiceStatusBadge type="invoice" status={invoice.status} />
          <InvoiceStatusBadge type="payment" paymentStatus={invoice.paymentStatus} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Created on {new Date(invoice.date).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {invoice.status !== "CANCELLED" && (
          <>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            {invoice.status !== "COMPLETED" && (
              <Button variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
