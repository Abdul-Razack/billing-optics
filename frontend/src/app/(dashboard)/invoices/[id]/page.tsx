"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
import { MOCK_INVOICES } from "@/lib/mock-invoice-data";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceSummary } from "@/components/invoices/InvoiceSummary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerCard } from "@/components/customers/CustomerCard";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const invoice = MOCK_INVOICES.find(i => i.id === resolvedParams.id);

  if (!invoice) {
    return (
      <PageContainer title="Invoices">
        <EmptyState title="Invoice Not Found" description="The invoice you are trying to view does not exist." />
      </PageContainer>
    );
  }

  const customer = MOCK_CUSTOMERS.find(c => c.id === invoice.customerId);

  return (
    <PageContainer title="Invoice Details" description="View complete invoice details and history.">
      <InvoiceHeader invoice={invoice} />

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Invoice Items</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="customer">Customer Details</TabsTrigger>
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-md border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-[100px] text-right">Qty</TableHead>
                    <TableHead className="w-[120px] text-right">Unit Price</TableHead>
                    <TableHead className="w-[120px] text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">{item.sku}</div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <InvoiceSummary 
                subtotal={invoice.subtotal}
                gstTotal={invoice.gstTotal}
                discountTotal={invoice.discountTotal}
                grandTotal={invoice.grandTotal}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.length > 0 ? (
                  invoice.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.date).toLocaleString()}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.referenceNumber || "—"}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        ${payment.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="customer">
          {customer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomerCard title="Contact Information">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium text-lg">{customer.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{customer.email || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{customer.address || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </CustomerCard>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              This was a walk-in customer sale. No profile details available.
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
            Activity timeline will be integrated with the backend audit logs.
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
