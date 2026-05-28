import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, X, RotateCcw } from "lucide-react";
import { ApiCustomer } from "@/types/customer";

interface EditSummaryPanelProps {
  customer: ApiCustomer | null;
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  isSubmitting: boolean;
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
  onCancel: () => void;
}

export function EditSummaryPanel({
  customer,
  itemCount,
  subtotal,
  discountTotal,
  taxTotal,
  grandTotal,
  amountPaid,
  balanceDue,
  isSubmitting,
  isDirty,
  onSave,
  onReset,
  onCancel
}: EditSummaryPanelProps) {
  return (
    <Card className="border-primary/20 shadow-md sticky top-6">
      <CardHeader className="bg-primary/5 pb-4 border-b">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          Summary
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
            <span className="text-muted-foreground">Items ({itemCount})</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium text-emerald-600">-{formatCurrency(discountTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">{formatCurrency(taxTotal)}</span>
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
      <div className="p-6 bg-card rounded-b-lg space-y-3">
        <Button 
          className="w-full h-12 text-lg" 
          size="lg" 
          disabled={!isDirty || isSubmitting || itemCount === 0}
          onClick={onSave}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Changes
            </>
          )}
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="w-full"
            disabled={!isDirty || isSubmitting}
            onClick={onReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:bg-destructive/10"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
