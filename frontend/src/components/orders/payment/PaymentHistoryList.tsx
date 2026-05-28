import { formatCurrency } from "@/lib/utils";
import { ApiPayment } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Calendar, CreditCard, AlignLeft } from "lucide-react";

interface PaymentHistoryListProps {
  payments: ApiPayment[];
}

export function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
  if (!payments || payments.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg bg-gray-50 text-gray-500">
        <Receipt className="mx-auto h-8 w-8 mb-2 opacity-20" />
        <p className="text-sm">No payments recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="overflow-hidden">
          <div className="flex border-l-4 border-emerald-500">
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{formatCurrency(payment.amount)}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    {payment.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  {payment.createdAt && new Date(payment.createdAt).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-3">
                {payment.referenceNumber && (
                  <div className="flex items-start text-gray-600">
                    <CreditCard className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span className="break-all"><span className="font-medium mr-1">Ref:</span>{payment.referenceNumber}</span>
                  </div>
                )}
                {(payment as any).notes && (
                  <div className="flex items-start text-gray-600 sm:col-span-2">
                    <AlignLeft className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span className="italic">{(payment as any).notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
