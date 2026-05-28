"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomerSelector } from "@/components/orders/CustomerSelector";
import { ProductOrderSelector } from "@/components/orders/ProductOrderSelector";
import { InvoiceLineItems, InvoiceLineItem } from "@/components/orders/InvoiceLineItems";
import { PaymentSection } from "@/components/orders/PaymentSection";
import { OrderService } from "@/services/order.service";
import { ApiProduct } from "@/services/product.service";
import { ApiCustomer } from "@/types/customer";
import { PaymentMethod } from "@/types/order";
import { toast } from "sonner";
import { Loader2, Receipt, Save, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function CreateOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  // Live Math
  const grandTotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  }, [lineItems]);

  const balanceDue = Math.max(0, grandTotal - amountPaid);

  // Handlers
  const handleAddProduct = (product: ApiProduct) => {
    setLineItems((prev) => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, qty: number) => {
    setLineItems((prev) => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const handleRemoveProduct = (productId: number) => {
    setLineItems((prev) => prev.filter(i => i.product.id !== productId));
  };

  // Set default full payment when items change, if not manually overridden
  const handleAutoFillPayment = () => {
    setAmountPaid(grandTotal);
  };

  const handleSubmit = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }
    if (amountPaid < 0) {
      toast.error("Amount paid cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerId,
        items: lineItems.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        payments: amountPaid > 0 ? [{
          method: paymentMethod,
          amount: amountPaid,
          reference: paymentMethod !== "CASH" ? referenceNumber : undefined
        }] : undefined
      };

      // Create a frontend generated session string ID for idempotency/tracking
      const tempSessionId = `SESS-${Date.now()}`;
      
      const newInvoice = await OrderService.createOrder(tempSessionId, payload);
      toast.success("Order created successfully!");
      setSuccessId(newInvoice.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successId) {
    return (
      <PageContainer title="Order Successful" description="The checkout session has completed.">
        <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-lg mt-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Invoice Created!</h2>
          <p className="text-muted-foreground mb-8">
            The order has been successfully saved to the ledger and inventory has been deducted.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href={`/orders/${successId}`}>
                View Invoice
              </Link>
            </Button>
            <Button onClick={() => {
              setSuccessId(null);
              setLineItems([]);
              setCustomerId(undefined);
              setCustomer(null);
              setAmountPaid(0);
              setReferenceNumber("");
            }} size="lg">
              Create Another Order
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Create Order" description="Start a new billing session and checkout items.">
      <ProductHeader title="New Order Checkout">
        <Button variant="outline" asChild disabled={isSubmitting}>
          <Link href="/orders">Cancel</Link>
        </Button>
      </ProductHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Customer Information</CardTitle>
              <CardDescription>Select a registered customer or leave blank for a walk-in guest.</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerSelector 
                value={customerId} 
                onChange={(id, c) => {
                  setCustomerId(id);
                  setCustomer(c);
                }} 
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Order Items</CardTitle>
                <CardDescription>Search and add products to the invoice.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductOrderSelector onAdd={handleAddProduct} disabled={isSubmitting} />
              
              <div className="pt-2">
                <InvoiceLineItems 
                  items={lineItems} 
                  onChangeQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveProduct}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Payment</CardTitle>
                  <CardDescription>Record immediate payment for this order.</CardDescription>
                </div>
                {grandTotal > 0 && amountPaid !== grandTotal && (
                  <Button variant="secondary" size="sm" onClick={handleAutoFillPayment} disabled={isSubmitting}>
                    Fill Full Amount
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PaymentSection 
                method={paymentMethod}
                amount={amountPaid}
                reference={referenceNumber}
                onMethodChange={setPaymentMethod}
                onAmountChange={setAmountPaid}
                onReferenceChange={setReferenceNumber}
                disabled={isSubmitting || lineItems.length === 0}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 pb-4 border-b">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Receipt className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 pb-2">
                  <div className="text-sm font-medium mb-1 text-muted-foreground uppercase tracking-wider">Bill To</div>
                  <div className="font-semibold text-lg">{customer ? customer.fullName : "Walk-in Customer"}</div>
                  {customer && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {customer.phone || customer.email}
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({lineItems.length})</span>
                    <span className="font-medium">{formatCurrency(grandTotal)}</span>
                  </div>
                  {/* Backend does not natively calculate tax or discount correctly yet from frontend inputs, 
                      so we only show what backend will process: grandTotal = sum of lines */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium text-muted-foreground">Calculated by Backend</span>
                  </div>
                </div>

                <div className="bg-muted/30 p-6 border-y">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-foreground">Grand Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm mt-4">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(amountPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-muted-foreground font-medium">Balance Due</span>
                    <span className="font-semibold">{formatCurrency(balanceDue)}</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 bg-card rounded-b-lg">
                <Button 
                  className="w-full h-12 text-lg" 
                  size="lg" 
                  disabled={isSubmitting || lineItems.length === 0}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Complete Checkout
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
