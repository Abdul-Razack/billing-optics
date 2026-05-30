"use client";

import { use, useRef } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
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
import { PrintableReceipt } from "@/components/invoices/PrintableReceipt";
import { useFetch } from "@/hooks/useApi";
import { ApiInvoiceDetail, Invoice } from "@/types/invoice";
import { ApiSettings } from "@/services/settings.service";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: response, isLoading, error } = useFetch<{ success: boolean, data: ApiInvoiceDetail }>(
    id && id !== "undefined" ? `/invoices/${id}` : "",
    { enabled: !!(id && id !== "undefined") }
  );

  const { data: settingsResponse } = useFetch<{ success: boolean, data: ApiSettings }>("/settings", { enabled: true });
  
  if (!id || id === "undefined") {
    return (
      <PageContainer title="Invoices">
        <EmptyState title="Invalid Invoice ID" description="The invoice ID provided is invalid." />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer title="Invoice Details">
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          Loading invoice details...
        </div>
      </PageContainer>
    );
  }

  if (error || !response?.data) {
    return (
      <PageContainer title="Invoices">
        <EmptyState title="Invoice Not Found" description="The invoice you are trying to view does not exist or failed to load." />
      </PageContainer>
    );
  }

  const apiData = response.data;

  // Adapter from ApiInvoiceDetail to legacy Invoice interface
  const invoice: Invoice = {
    id: String(apiData.id),
    invoiceNumber: apiData.invoiceNumber,
    customerId: apiData.customer?.id ? String(apiData.customer.id) : "",
    date: apiData.createdAt,
    items: (apiData.lines || []).map((item, idx) => ({
      id: item.id || String(idx),
      productId: String(item.productId),
      productName: item.productName,
      sku: item.productSku,
      quantity: item.quantity,
      unitPrice: item.unitPrice / 100, // DB stores in cents
      total: item.subtotal / 100,
    })),
    subtotal: apiData.subtotal / 100,
    gstTotal: apiData.taxTotal / 100,
    discountTotal: apiData.discountTotal / 100,
    grandTotal: apiData.grandTotal / 100,
    amountPaid: apiData.amountPaid / 100,
    status: apiData.status as "DRAFT" | "COMPLETED" | "CANCELLED",
    paymentStatus: apiData.paymentStatus as "PENDING" | "PARTIAL" | "PAID",
    payments: apiData.payments.map((p, idx) => ({
      id: String(idx),
      date: p.createdAt,
      amount: p.amount / 100,
      method: p.paymentMethod as "CASH" | "CARD" | "UPI" | "BANK_TRANSFER",
      referenceNumber: p.referenceNumber || undefined,
      notes: p.notes || undefined,
    })),
    notes: apiData.notes || undefined,
  };

  const customer = apiData.customer ? {
    id: String(apiData.customer.id),
    fullName: apiData.customer.name,
    phone: apiData.customer.phone,
    email: apiData.customer.email || "",
    address: apiData.customer.address || "",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  } : undefined;

  return (
    <>
      <div className="print:hidden">
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
                    amountPaid={invoice.amountPaid}
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
      </div>

      <div className="hidden">
        <PrintableReceipt ref={printRef} invoice={invoice} customer={customer} settings={settingsResponse?.data} />
      </div>
    </>
  );
}
