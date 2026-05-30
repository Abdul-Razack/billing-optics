import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiInvoice, PaymentMethod } from "@/types/order";
import { OrderService } from "@/services/order.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ApiInvoice;
  initialIsFull: boolean;
  onPaymentSuccess: () => void;
}

export function PaymentEntryModal({ open, onOpenChange, invoice, initialIsFull, onPaymentSuccess }: PaymentEntryModalProps) {
  const balanceDue = Math.max(0, invoice.grandTotal - invoice.amountPaid);
  
  const [amount, setAmount] = useState<string>(initialIsFull ? (balanceDue / 100).toFixed(2) : "");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Update amount if modal opens with different intent
  useEffect(() => {
    if (open) {
      setAmount(initialIsFull ? (balanceDue / 100).toFixed(2) : "");
      setMethod("CASH");
      setReference("");
      setNotes("");
      setIsSubmitting(false);
    }
  }, [open, initialIsFull, balanceDue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    const amountInCents = Math.round(parsedAmount * 100);

    if (isNaN(parsedAmount) || amountInCents <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (amountInCents > balanceDue) {
      toast.error(`Cannot overpay. Maximum allowed is ${formatCurrency(balanceDue)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await OrderService.addPayment(invoice.id, {
        amount: amountInCents,
        method,
        reference: reference || undefined,
      });
      
      toast.success("Payment recorded successfully.");
      setIsSubmitting(false);
      onPaymentSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to record payment.");
      if (isMounted.current) setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(val) => {
        if (isSubmitting) return;
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for Invoice #{invoice.invoiceNumber}. Balance due: <strong className="text-gray-900">{formatCurrency(balanceDue)}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  max={balanceDue / 100}
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI / Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input 
                id="reference" 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transaction ID, Check #, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this payment..."
                className="resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
