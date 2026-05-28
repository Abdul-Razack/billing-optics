import { ApiInvoice } from "@/types/order";
import { formatCurrency } from "@/lib/utils";

export function InvoiceSummary({ invoice }: { invoice: ApiInvoice }) {
  const balanceDue = invoice.grandTotal - invoice.amountPaid;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Financial Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        
        {invoice.discountTotal > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-{formatCurrency(invoice.discountTotal)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>{formatCurrency(invoice.taxTotal)}</span>
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Grand Total</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.grandTotal)}</span>
          </div>
        </div>
        
        <div className="flex justify-between text-gray-600 pt-2">
          <span>Amount Paid</span>
          <span>{formatCurrency(invoice.amountPaid)}</span>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md mt-4 border">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Balance Due</span>
            <span className={`text-lg font-bold ${balanceDue > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {formatCurrency(balanceDue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
