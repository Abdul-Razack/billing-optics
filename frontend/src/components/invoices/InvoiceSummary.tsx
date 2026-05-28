import { cn } from "@/lib/utils";

interface InvoiceSummaryProps {
  subtotal: number;
  gstTotal: number;
  discountTotal: number;
  grandTotal: number;
  className?: string;
}

export function InvoiceSummary({ subtotal, gstTotal, discountTotal, grandTotal, className }: InvoiceSummaryProps) {
  const format = (val: number) => `$${val.toFixed(2)}`;

  return (
    <div className={cn("bg-card rounded-lg border border-border shadow-sm p-6 space-y-4", className)}>
      <h3 className="font-medium text-foreground border-b border-border pb-2">Order Summary</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{format(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>GST Tax</span>
          <span>{format(gstTotal)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{format(discountTotal)}</span>
          </div>
        )}
      </div>
      
      <div className="border-t border-border pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">Grand Total</span>
          <span className="font-bold text-2xl text-primary">{format(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
