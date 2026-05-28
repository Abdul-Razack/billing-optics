import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ApiInvoice } from "@/types/order";
import { Button } from "@/components/ui/button";

interface PaymentSummaryCardProps {
  invoice: ApiInvoice;
  onRecordPayment: (isFull: boolean) => void;
}

export function PaymentSummaryCard({ invoice, onRecordPayment }: PaymentSummaryCardProps) {
  const balanceDue = Math.max(0, invoice.grandTotal - invoice.amountPaid);
  const isPaid = invoice.paymentStatus === "PAID" || balanceDue === 0;

  return (
    <Card className={isPaid ? "border-emerald-200" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Payment Summary</span>
          {isPaid && <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Settled</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Invoice Total</span>
          <span className="font-medium">{formatCurrency(invoice.grandTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Amount Paid</span>
          <span className="font-medium text-emerald-600">{formatCurrency(invoice.amountPaid)}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t">
          <span className="font-semibold text-foreground">Balance Due</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(balanceDue)}</span>
        </div>

        {!isPaid && (
          <div className="pt-4 flex gap-2">
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
              onClick={() => onRecordPayment(true)}
            >
              Pay Full
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => onRecordPayment(false)}
            >
              Partial Pay
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
