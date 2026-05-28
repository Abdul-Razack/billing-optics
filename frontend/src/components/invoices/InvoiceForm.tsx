"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { InvoiceItem, PaymentMethod } from "@/types/invoice";
import { Product } from "@/types/product";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";
import { ProductSelector } from "./ProductSelector";
import { CartTable } from "./CartTable";
import { InvoiceSummary } from "./InvoiceSummary";
import { PaymentForm } from "./PaymentForm";
import { CheckCircle } from "lucide-react";

export function InvoiceForm() {
  const router = useRouter();

  // POS State
  const [customerId, setCustomerId] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
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
  const discountTotal = (subtotal + gstTotal) * (discountPercent / 100);
  const grandTotal = subtotal + gstTotal - discountTotal;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Mock Invoice Saved", {
      customerId, items, discountPercent, subtotal, gstTotal, grandTotal,
      payment: { amount: paymentAmount, method: paymentMethod, ref: paymentRef, notes: paymentNotes }
    });
    router.push("/invoices");
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN: Billing / Cart */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Select value={customerId} onValueChange={(v) => { if(v) setCustomerId(v) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in Customer (Select to change)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walkin">Walk-in Customer</SelectItem>
                  {MOCK_CUSTOMERS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.fullName} ({c.phone})</SelectItem>
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
      <div className="space-y-6">
        <InvoiceSummary 
          subtotal={subtotal}
          gstTotal={gstTotal}
          discountTotal={discountTotal}
          grandTotal={grandTotal}
        />

        <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Order Discount (%)</label>
            <Input 
              type="number" 
              min="0" 
              max="100" 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
            />
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

        <div className="flex gap-4">
          <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="w-full" disabled={items.length === 0}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Sale
          </Button>
        </div>
      </div>
    </form>
  );
}
