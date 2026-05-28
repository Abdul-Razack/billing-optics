"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { OrderService } from "@/services/order.service";
import { CustomerService } from "@/services/customer.service";
import { ProductService } from "@/services/product.service";
import { ApiInvoice } from "@/types/order";
import { ApiCustomer } from "@/types/customer";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { OrderHeader } from "@/components/orders/details/OrderHeader";
import { CustomerInvoiceCard } from "@/components/orders/details/CustomerInvoiceCard";
import { OrderItemsTable } from "@/components/orders/details/OrderItemsTable";
import { InvoiceSummary } from "@/components/orders/details/InvoiceSummary";
import { PaymentTimeline } from "@/components/orders/details/PaymentTimeline";
import { OrderActionsBar } from "@/components/orders/details/OrderActionsBar";
import { PrintableInvoice } from "@/components/orders/print/PrintableInvoice";
import { InvoicePrintToolbar } from "@/components/orders/print/InvoicePrintToolbar";
import { PaymentSummaryCard } from "@/components/orders/payment/PaymentSummaryCard";
import { PaymentHistoryList } from "@/components/orders/payment/PaymentHistoryList";
import { PaymentEntryModal } from "@/components/orders/payment/PaymentEntryModal";

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const [invoice, setInvoice] = useState<ApiInvoice | null>(null);
  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [productsMap, setProductsMap] = useState<Record<number, { name: string; sku?: string }>>({});
  const printRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refetchTick, setRefetchTick] = useState(0);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalIsFull, setPaymentModalIsFull] = useState(true);

  const handleRecordPayment = (isFull: boolean) => {
    setPaymentModalIsFull(isFull);
    setPaymentModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch Invoice
        const invoiceData = await OrderService.getOrderById(id);
        if (!isMounted) return;
        setInvoice(invoiceData);
        
        // 2. Fetch Customer if customerId exists
        if (invoiceData.customerId) {
          try {
            const customerData = await CustomerService.getCustomerById(invoiceData.customerId);
            if (isMounted) setCustomer(customerData);
          } catch (err) {
            console.error("Failed to fetch customer", err);
          }
        }
        
        // 3. Fetch Products for lines
        if (invoiceData.lines && invoiceData.lines.length > 0) {
          try {
            const productIds = Array.from(new Set(invoiceData.lines.map(l => l.productId)));
            const map: Record<number, { name: string; sku?: string }> = {};
            
            await Promise.all(
              productIds.map(async (pid) => {
                try {
                  const pData = await ProductService.getProductById(pid);
                  map[pid] = { name: pData.name, sku: pData.sku };
                } catch (e) {
                  console.error(`Failed to fetch product ${pid}`, e);
                }
              })
            );
            
            if (isMounted) setProductsMap(map);
          } catch (err) {
            console.error("Failed to fetch products", err);
          }
        }
        
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, refetchTick]);

  const printableLineItems = useMemo(() => {
    if (!invoice?.lines) return [];
    return invoice.lines.map((line) => ({
      product: {
        id: line.productId,
        name: productsMap[line.productId]?.name || `Item ${line.productId}`,
        sku: productsMap[line.productId]?.sku,
        sellingPrice: line.unitPrice,
      } as any,
      quantity: line.quantity,
    }));
  }, [invoice, productsMap]);

  return (
    <PageContainer 
      title={`Order ${invoice?.invoiceNumber || `#${id}`}`} 
      description="View invoice details and payment information."
    >
      <ProductHeader title={`Order Details`}>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>
          </Button>
          {invoice && <InvoicePrintToolbar printRef={printRef} invoiceNumber={invoice.invoiceNumber || String(invoice.id)} invoiceId={invoice.id} />}
          {invoice && <OrderActionsBar invoice={invoice} onRecordPayment={() => handleRecordPayment(true)} />}
        </div>
      </ProductHeader>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center p-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-500 animate-pulse">Loading order details...</p>
          </div>
        ) : error || !invoice ? (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-8 rounded-lg text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="mb-6">The requested invoice could not be loaded or does not exist.</p>
            <Button variant="outline" asChild>
              <Link href="/orders">Return to Orders List</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 font-sans">
            <OrderHeader invoice={invoice} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <OrderItemsTable lines={invoice.lines || []} productsMap={productsMap} />
                
                {invoice.notes && (
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h2 className="text-lg font-semibold mb-2 text-gray-900 border-b pb-2">Notes / Terms</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <CustomerInvoiceCard customer={customer} mockName={invoice.customerName} />
                <PaymentSummaryCard invoice={invoice} onRecordPayment={handleRecordPayment} />
                
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Payment History</h2>
                  <PaymentHistoryList payments={invoice.payments || []} />
                </div>
              </div>
            </div>

            {/* Hidden Print Wrapper */}
            <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[9999]">
              <PrintableInvoice 
                ref={printRef}
                invoice={invoice} 
                customer={customer} 
                lineItems={printableLineItems} 
              />
            </div>
            
            {/* Screen-reader only off-screen container for PDF export if not printing */}
            <div className="absolute top-[-9999px] left-[-9999px] print:hidden">
              <PrintableInvoice 
                ref={printRef}
                invoice={invoice} 
                customer={customer} 
                lineItems={printableLineItems} 
              />
            </div>
            
            <PaymentEntryModal 
              open={paymentModalOpen} 
              onOpenChange={setPaymentModalOpen} 
              invoice={invoice} 
              initialIsFull={paymentModalIsFull} 
              onPaymentSuccess={() => setRefetchTick(t => t + 1)}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
