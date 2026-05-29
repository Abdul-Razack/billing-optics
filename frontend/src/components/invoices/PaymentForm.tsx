import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMethod } from "@/types/invoice";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  amount: number;
  method: PaymentMethod;
  referenceNumber: string;
  notes: string;
  onAmountChange: (amount: number) => void;
  onMethodChange: (method: PaymentMethod) => void;
  onReferenceChange: (ref: string) => void;
  onNotesChange: (notes: string) => void;
  grandTotal: number;
}

export function PaymentForm({ 
  amount, 
  method, 
  referenceNumber, 
  notes, 
  onAmountChange, 
  onMethodChange, 
  onReferenceChange, 
  onNotesChange,
  grandTotal
}: PaymentFormProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-5 space-y-4">
      <h3 className="font-medium text-foreground border-b border-border pb-2">Payment Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <Select value={method} onValueChange={(v) => { if(v) onMethodChange(v as PaymentMethod) }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="UPI">UPI / Wallet</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount Paid</label>
          <div className="relative">
            <span className="absolute left-2.5 top-2.5 text-muted-foreground text-sm">$</span>
            <Input 
              type="number" 
              step="0.01" 
              className="pl-6" 
              value={amount} 
              onChange={(e) => onAmountChange(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-between mt-1.5 items-center">
            <button 
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => onAmountChange(grandTotal)}
            >
              Pay Full Amount
            </button>
            <span className={cn(
              "text-xs font-semibold",
              (grandTotal - amount) > 0.01 ? "text-destructive" : "text-green-600"
            )}>
              Balance: ${(Math.max(0, grandTotal - amount)).toFixed(2)}
            </span>
          </div>
        </div>

        {method !== "CASH" && (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Reference Number</label>
            <Input 
              placeholder="e.g. Transaction ID, Check #..." 
              value={referenceNumber}
              onChange={(e) => onReferenceChange(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Payment Notes</label>
          <Textarea 
            placeholder="Optional notes..." 
            className="resize-none h-20"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
