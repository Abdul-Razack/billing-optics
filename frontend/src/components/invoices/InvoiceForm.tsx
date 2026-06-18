"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { InvoiceItem, PaymentMethod } from "@/types/invoice";
import { Product } from "@/types/product";
import { fetchClient } from "@/lib/api-client";
import { ProductSelector } from "./ProductSelector";
import { CartTable } from "./CartTable";
import { InvoiceSummary } from "./InvoiceSummary";
import { PaymentForm } from "./PaymentForm";
import { OrderService } from "@/services/order.service";
import { CheckCircle } from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";

export function InvoiceForm() {
  const router = useRouter();
  const { activeBranch } = useBranch();
  // Initialised in useEffect to keep impure Date.now()/Math.random() calls
  // out of the render phase (React Compiler requirement).
  const sessionIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `SESS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }, []);

  // Data State
  const [customers, setCustomers] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    fetchClient<{ data: any[] }>("/customers?limit=100").then(res => {
      if (res.data) setCustomers(res.data);
    });
    fetchClient<{ data: any[] }>("/offers").then(res => {
      if (res.data) setOffers(res.data);
    });
  }, []);

  // POS State
  const [customerId, setCustomerId] = useState<string>("walkin");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  const [offerId, setOfferId] = useState<string>("none");
  const [loyaltyPointsRedeemed, setLoyaltyPointsRedeemed] = useState<number>(0);
  
  // Payment State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  // Derived calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstTotal = items.reduce((sum, item) => {
    // In a real app we'd fetch GST % from the product. Mocking a flat 10% for demonstration.
    return sum + (item.total * 0.1);
  }, 0);
  
  const selectedOffer = offers.find(o => o.id.toString() === offerId);
  const selectedCustomer = customers.find(c => c.id.toString() === customerId);

  let offerDiscountValue = 0;
  if (selectedOffer) {
    if (selectedOffer.type === 'PERCENTAGE') {
       offerDiscountValue = (subtotal + gstTotal) * (selectedOffer.value / 100);
    } else {
       offerDiscountValue = selectedOffer.value; // Flat
    }
  }
  
  const manualDiscount = (subtotal + gstTotal) * (discountPercent / 100);
  const pointsDiscount = loyaltyPointsRedeemed; // 1 pt = 1 rs
  
  const discountTotal = manualDiscount + offerDiscountValue + pointsDiscount;
  const grandTotal = Math.max(0, subtotal + gstTotal - discountTotal);

  // Handlers
  const handleAddProduct = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } 
          : i
        );
      }
      return [...prev, {
        id: `item_${Date.now()}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice,
        total: product.sellingPrice
      }];
    });
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setItems(prev => prev.map(i => i.id === id 
      ? { ...i, quantity: qty, total: qty * i.unitPrice } 
      : i
    ));
  };

  const handleUpdatePrice = (id: string, price: number) => {
    setItems(prev => prev.map(i => i.id === id 
      ? { ...i, unitPrice: price, total: i.quantity * price } 
      : i
    ));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customerId: customerId !== "walkin" ? parseInt(customerId) : undefined,
        locationId: activeBranch?.id ?? undefined,
        items: items.map(i => ({
          productId: Number(i.productId),
          quantity: i.quantity
        })),
        offerId: offerId !== "none" ? parseInt(offerId) : undefined,
        loyaltyPointsRedeemed: loyaltyPointsRedeemed > 0 ? loyaltyPointsRedeemed : undefined,
        payments: paymentAmount > 0 ? [{
          method: paymentMethod,
          amount: Math.round(paymentAmount * 100),
          reference: paymentRef || undefined
        }] : undefined
      };

      const invoice = await OrderService.createOrder(sessionIdRef.current || "", payload);
      router.push(`/orders/${invoice.invoiceId}`);
    } catch (error) {
      console.error("Checkout failed:", error);
      // In a real app we'd show a toast error here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Billing / Cart */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-card rounded-lg border border-border shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Select value={customerId} onValueChange={(v) => { if(v) setCustomerId(v) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in Customer (Select to change)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walkin">Walk-in Customer</SelectItem>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.fullName} ({c.phone}) {c.loyaltyPoints > 0 ? `- ${c.loyaltyPoints} pts` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-sm font-medium">Search & Add Products</label>
            <ProductSelector onSelect={handleAddProduct} />
          </div>

          <div className="pt-4">
            <CartTable 
              items={items} 
              onUpdateQuantity={handleUpdateQuantity}
              onUpdatePrice={handleUpdatePrice}
              onRemove={handleRemoveItem}
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Totals & Payment */}
      <div className="lg:col-span-4 space-y-6">
        <InvoiceSummary 
          subtotal={subtotal}
          gstTotal={gstTotal}
          discountTotal={discountTotal}
          grandTotal={grandTotal}
        />

        <div className="bg-card rounded-lg border border-border shadow-sm p-5 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Order Discount (%)</label>
              <Input 
                type="NUMBER" 
                min="0" 
                max="100" 
                value={discountPercent} 
                onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Apply Offer/Coupon</label>
              <Select value={offerId} onValueChange={(v) => { if (v) setOfferId(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="No Offer Selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Offer Selected</SelectItem>
                  {offers.filter(o => o.isActive).map(o => (
                    <SelectItem key={o.id} value={o.id.toString()}>
                      {o.name} ({o.type === 'PERCENTAGE' ? `${o.value}%` : `₹${o.value}`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && selectedCustomer.loyaltyPoints > 0 && (
              <div className="space-y-2 p-3 bg-muted rounded-md border">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-primary">Redeem Loyalty Points</label>
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {selectedCustomer.loyaltyPoints} pts available
                  </span>
                </div>
                <Input 
                  type="number" 
                  min="0" 
                  max={selectedCustomer.loyaltyPoints} 
                  value={loyaltyPointsRedeemed || ""} 
                  onChange={(e) => {
                    let val = Number(e.target.value) || 0;
                    if (val > selectedCustomer.loyaltyPoints) val = selectedCustomer.loyaltyPoints;
                    setLoyaltyPointsRedeemed(val);
                  }}
                  placeholder={`Max ${selectedCustomer.loyaltyPoints}`}
                />
                <p className="text-[10px] text-muted-foreground">1 Point = ₹1 Discount</p>
              </div>
            )}
          </div>
        </div>

        <PaymentForm 
          amount={paymentAmount}
          method={paymentMethod}
          referenceNumber={paymentRef}
          notes={paymentNotes}
          onAmountChange={setPaymentAmount}
          onMethodChange={setPaymentMethod}
          onReferenceChange={setPaymentRef}
          onNotesChange={setPaymentNotes}
          grandTotal={grandTotal}
        />

        <div className="flex gap-4 pt-2">
          <Button type="button" variant="outline" size="lg" className="w-1/3" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" size="lg" className="w-2/3 text-base shadow-md disabled:opacity-50" disabled={isSubmitting || items.length === 0}>
            <CheckCircle className="mr-2 h-5 w-5" />
            Complete Sale
          </Button>
        </div>
      </div>
    </form>
  );
}
