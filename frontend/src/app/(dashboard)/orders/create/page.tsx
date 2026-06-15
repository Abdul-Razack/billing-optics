"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { OfferService } from "@/services/offer.service";
import { ApiProduct } from "@/services/product.service";
import { CustomerService } from "@/services/customer.service";
import { ApiCustomer } from "@/types/customer";
import { PaymentMethod } from "@/types/order";
import { Offer } from "@/types/offer";
import { toast } from "sonner";
import { Loader2, Receipt, Save, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function CreateOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  // Offers State
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<number | undefined>();


  const [isLoaded, setIsLoaded] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    // Initialise the idempotency key outside of render
    sessionIdRef.current = `SESS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Defer all setState calls to the next microtask so they don't run
    // synchronously within the effect body (React Compiler requirement).
    void (async () => {
      try {
        const saved = localStorage.getItem("order_cart_draft");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.customerId !== undefined) setCustomerId(parsed.customerId);
          if (parsed.customer) setCustomer(parsed.customer);
          if (parsed.lineItems) setLineItems(parsed.lineItems);
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
          if (parsed.amountPaid) setAmountPaid(parsed.amountPaid);
          if (parsed.referenceNumber) setReferenceNumber(parsed.referenceNumber);
        }

        // If customerId is provided in URL, it overrides the draft's customer (e.g. "Create Invoice" from profile)
        const urlParams = new URLSearchParams(window.location.search);
        const queryCustomerId = urlParams.get('customerId');
        if (queryCustomerId) {
          const id = parseInt(queryCustomerId, 10);
          if (!isNaN(id)) {
            setCustomerId(id);
            CustomerService.getCustomerById(id).then(c => {
              if (c) setCustomer(c);
            }).catch(console.error);
          }
        }

        // Load active offers
        OfferService.getOffers({ status: 'ACTIVE' }).then(offers => {
          setAvailableOffers(offers);
        }).catch(console.error);

      } catch (e) {
        console.error("Failed to load cart draft", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Save draft to localStorage whenever cart state changes
  useEffect(() => {
    if (!isLoaded) return;
    
    // Clear draft if cart is completely empty
    if (lineItems.length === 0 && !customerId && amountPaid === 0) {
      localStorage.removeItem("order_cart_draft");
      return;
    }
    
    localStorage.setItem("order_cart_draft", JSON.stringify({
      customerId,
      customer,
      lineItems,
      paymentMethod,
      amountPaid,
      referenceNumber
    }));

    // Generate a new idempotency key whenever the cart logic actually changes
    sessionIdRef.current = `SESS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, [isLoaded, customerId, customer, lineItems, paymentMethod, amountPaid, referenceNumber]);

  const totals = useMemo(() => {
    let sub = 0;
    let tax = 0;
    lineItems.forEach(item => {
      const itemTotal = item.product.sellingPrice * item.quantity;
      const itemTax = Math.round((itemTotal * (item.product.gstPercent || 0)) / 100);
      sub += itemTotal;
      tax += itemTax;
    });

    let discount = 0;
    if (selectedOfferId) {
      const offer = availableOffers.find(o => o.id === selectedOfferId);
      if (offer && sub >= (offer.minOrderValue || 0)) {
        
        let eligibleSubtotal = sub;
        if (offer.applicableProducts?.length || offer.applicableCategories?.length) {
          eligibleSubtotal = 0;
          lineItems.forEach(item => {
            let isEligible = false;
            if (offer.applicableProducts?.length && offer.applicableProducts.includes(item.product.id)) {
               isEligible = true;
            } else if (offer.applicableCategories?.length && item.product.categoryId && offer.applicableCategories.includes(item.product.categoryId)) {
               isEligible = true;
            }
            if (isEligible) {
               eligibleSubtotal += (item.product.sellingPrice * item.quantity);
            }
          });
        }

        if (eligibleSubtotal > 0) {
          if (offer.type === 'PERCENTAGE') {
            discount = Math.round((eligibleSubtotal * offer.value) / 100);
          } else {
            discount = offer.value;
          }
          if (discount > sub + tax) discount = sub + tax;
        }
      }
    }


    return {
      subtotal: sub,
      taxTotal: tax,
      discountTotal: discount,
      grandTotal: sub + tax - discount
    };
  }, [lineItems, selectedOfferId, availableOffers]);

  const grandTotal = totals.grandTotal;

  const balanceDue = Math.max(0, grandTotal - Math.round(amountPaid * 100));

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
    setAmountPaid(grandTotal / 100);
  };

  const handleSubmit = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }
    
    const amountPaidCents = Math.round(amountPaid * 100);
    
    if (amountPaid < 0) {
      toast.error("Amount paid cannot be negative.");
      return;
    }
    if (amountPaidCents > grandTotal) {
      toast.error(`Amount paid cannot exceed grand total of ${formatCurrency(grandTotal)}.`);
      return;
    }

    if (isSubmitting) return; // Prevent duplicate submissions

    setIsSubmitting(true);
    try {
      const amountPaidCents = Math.round(amountPaid * 100);
      const payload = {
        customerId,
        items: lineItems.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        offerId: selectedOfferId,
        payments: amountPaidCents > 0 ? [{
          method: paymentMethod,
          amount: amountPaidCents,
          reference: paymentMethod !== "CASH" ? referenceNumber : undefined
        }] : undefined
      };

      // Use the stable idempotency key that is tied to current cart state
      const idempotencyKey = sessionIdRef.current ?? `SESS-FALLBACK-${Date.now()}`;
      const newInvoice = await OrderService.createOrder(idempotencyKey, payload);
      toast.success("Order created successfully!");
      // Reset state immediately so useEffect doesn't re-save the draft
      setLineItems([]);
      setCustomerId(undefined);
      setCustomer(null);
      setAmountPaid(0);
      setReferenceNumber("");
      setPaymentMethod("CASH");
      setSelectedOfferId(undefined);
      setDiscountTotal(0);
      
      setSuccessId(newInvoice.invoiceId);
      localStorage.removeItem("order_cart_draft");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create order";
      const data = (err as { data?: { message?: string } })?.data;
      toast.error(data?.message || message);
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
                customer={customer}
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

          {availableOffers.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Offers & Promotions</CardTitle>
                <CardDescription>Select an applicable offer to apply to this order.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableOffers.map(offer => {
                    let hasEligibleItems = true;
                    if (offer.applicableProducts?.length || offer.applicableCategories?.length) {
                      hasEligibleItems = lineItems.some(item => 
                        (offer.applicableProducts?.length && offer.applicableProducts.includes(item.product.id)) ||
                        (offer.applicableCategories?.length && item.product.categoryId && offer.applicableCategories.includes(item.product.categoryId))
                      );
                    }
                    const isEligible = totals.subtotal >= (offer.minOrderValue || 0) && hasEligibleItems;
                    
                    return (
                      <div 
                        key={offer.id}
                        onClick={() => {
                          if (isEligible) {
                            setSelectedOfferId(offer.id === selectedOfferId ? undefined : offer.id);
                          }
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${!isEligible ? 'opacity-50 cursor-not-allowed bg-muted border-transparent' : selectedOfferId === offer.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                      >
                        <div className="font-semibold text-sm mb-1">{offer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {offer.type === 'PERCENTAGE' ? `${offer.value}% OFF` : `₹${(offer.value / 100).toFixed(2)} OFF`}
                        </div>
                        {offer.minOrderValue > 0 && (
                          <div className="text-[10px] text-muted-foreground mt-2">
                            Min: ₹{(offer.minOrderValue / 100).toFixed(2)}
                          </div>
                        )}
                        {(offer.applicableProducts?.length || offer.applicableCategories?.length) ? (
                          <div className="text-[10px] text-primary/70 mt-1">
                            Specific items only
                          </div>
                        ) : null}
                        {!isEligible && (
                          <div className="text-[10px] text-destructive mt-1 font-medium">
                            {totals.subtotal < (offer.minOrderValue || 0) ? `Add ₹${(((offer.minOrderValue || 0) - totals.subtotal) / 100).toFixed(2)} more` : "No eligible items in cart"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

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
                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-emerald-600">-{formatCurrency(totals.discountTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatCurrency(totals.taxTotal)}</span>
                  </div>
                </div>

                <div className="bg-muted/30 p-6 border-y">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-foreground">Grand Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm mt-4">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className={`font-medium ${Math.round(amountPaid * 100) > grandTotal ? 'text-destructive' : 'text-emerald-600'}`}>
                      {formatCurrency(Math.round(amountPaid * 100))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-muted-foreground font-medium">Balance Due</span>
                    <span className="font-semibold">{formatCurrency(balanceDue)}</span>
                  </div>
                  
                  {Math.round(amountPaid * 100) > grandTotal && (
                    <div className="text-xs text-destructive text-right mt-1 font-medium">
                      Amount exceeds grand total
                    </div>
                  )}
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
