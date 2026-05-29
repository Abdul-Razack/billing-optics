import { cn } from "@/lib/utils";

interface InvoiceSummaryProps {
  subtotal: number;
  gstTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid?: number;
  className?: string;
}

export function InvoiceSummary({ subtotal, gstTotal, discountTotal, grandTotal, amountPaid = 0, className }: InvoiceSummaryProps) {
  const format = (val: number) => `$${val.toFixed(2)}`;
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  return (
    <div className={cn("bg-card rounded-lg border border-border shadow-sm p-5 space-y-4 print:p-2 print:border-none print:shadow-none print:bg-transparent print:space-y-2", className)}>
      <h3 className="font-medium text-foreground border-b border-border pb-2 print:border-foreground/20 print:pb-1 print:text-sm">Order Summary</h3>
      
      <div className="space-y-1.5 text-sm print:space-y-1 print:text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">{format(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>GST Tax</span>
          <span className="font-medium text-foreground">{format(gstTotal)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount</span>
            <span>-{format(discountTotal)}</span>
          </div>
        )}
      </div>
      
      <div className="border-t border-border pt-4 mt-2 print:pt-2 print:mt-1 print:border-foreground/20">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-lg text-foreground print:text-sm">Grand Total</span>
          <span className="font-bold text-2xl text-foreground print:text-base">{format(grandTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span className="text-sm print:text-xs">Amount Paid</span>
          <span className="font-medium text-foreground print:text-xs">{format(amountPaid)}</span>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border border-dashed print:mt-2 print:pt-2">
          <span className="font-semibold text-lg text-foreground print:text-sm">Balance Due</span>
          <span className="font-bold text-3xl text-primary tracking-tight print:text-xl print:text-foreground">{format(balanceDue)}</span>
        </div>
      </div>
    </div>
  );
}
