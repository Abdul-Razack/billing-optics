import { PaymentMethod } from "@/types/order";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Banknote, Building2, Smartphone } from "lucide-react";

interface PaymentSectionProps {
  method: PaymentMethod;
  amount: number;
  reference: string;
  onMethodChange: (val: PaymentMethod) => void;
  onAmountChange: (val: number) => void;
  onReferenceChange: (val: string) => void;
  disabled?: boolean;
}

export function PaymentSection({
  method,
  amount,
  reference,
  onMethodChange,
  onAmountChange,
  onReferenceChange,
  disabled
}: PaymentSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase">Payment Method</Label>
        <Select 
          value={method} 
          onValueChange={(v) => onMethodChange(v as PaymentMethod)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" /> Cash
              </div>
            </SelectItem>
            <SelectItem value="CARD">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Card
              </div>
            </SelectItem>
            <SelectItem value="UPI">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" /> UPI
              </div>
            </SelectItem>
            <SelectItem value="BANK_TRANSFER">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Bank Transfer
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase">Amount Paid</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input 
            id="pos-amount-paid-input"
            type="NUMBER"
            min={0}
            step="0.01"
            className="pl-7"
            value={amount || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onAmountChange(isNaN(val) ? 0 : val);
            }}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2 sm:col-span-2 md:col-span-1">
        <Label className="text-xs text-muted-foreground uppercase">Ref Number (Optional)</Label>
        <Input 
          placeholder="Txn ID, Check #..." 
          value={reference}
          onChange={(e) => onReferenceChange(e.target.value)}
          disabled={disabled || method === "CASH"}
        />
      </div>
    </div>
  );
}
