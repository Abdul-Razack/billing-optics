import { ApiPayment } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2Icon, CreditCardIcon, LandmarkIcon, BanknoteIcon, QrCodeIcon } from "lucide-react";

export function PaymentTimeline({ payments }: { payments?: ApiPayment[] }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Payment History</h2>
        <p className="text-gray-500 italic text-center py-4">No payments recorded yet.</p>
      </div>
    );
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "CARD": return <CreditCardIcon className="h-4 w-4" />;
      case "BANK_TRANSFER": return <LandmarkIcon className="h-4 w-4" />;
      case "UPI": return <QrCodeIcon className="h-4 w-4" />;
      default: return <BanknoteIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-6 text-gray-900 border-b pb-2">Payment History</h2>
      
      <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
        {payments.map((payment, index) => (
          <div key={payment.id || index} className="relative">
            <div className="absolute -left-[35px] bg-emerald-100 text-emerald-600 rounded-full p-1 border-4 border-white">
              <CheckCircle2Icon className="h-4 w-4" />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100 text-gray-500">
                    {getMethodIcon(payment.paymentMethod)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payment.paymentMethod}</p>
                    {payment.createdAt && (
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                </div>
              </div>
              
              {payment.referenceNumber && (
                <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 flex items-center gap-2">
                  <span className="text-gray-400 font-medium">Ref:</span>
                  <span className="font-mono">{payment.referenceNumber}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
